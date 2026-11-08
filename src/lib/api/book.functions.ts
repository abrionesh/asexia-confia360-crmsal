import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseSnapshot, type Snapshot } from "./persist";

export type ClinicRoleName = "direccion" | "recepcion" | "medico";

export type ClinicBook = {
  revision: number;
  snapshot: Snapshot | null;
  role: ClinicRoleName | null;
  code: string | null;
  name: string | null;
  doctorName: string | null;
};

const emptyBook: ClinicBook = {
  revision: 0,
  snapshot: null,
  role: null,
  code: null,
  name: null,
  doctorName: null,
};

type MemberRow = {
  clinic_id: string;
  role: string;
  doctor_name: string | null;
  code: string;
  name: string;
  revision: number | string | null;
  snapshot: unknown;
};

function asRole(value: string): ClinicRoleName | null {
  if (value === "direccion" || value === "recepcion" || value === "medico") return value;
  return null;
}

function bookFrom(row: MemberRow | undefined): ClinicBook {
  if (!row) return emptyBook;
  const revision = Number(row.revision ?? 0);
  return {
    revision: Number.isFinite(revision) ? revision : 0,
    snapshot: parseSnapshot(row.snapshot),
    role: asRole(row.role),
    code: row.code,
    name: row.name,
    doctorName: row.doctor_name,
  };
}

async function sqlClient() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function memberOf(userId: string) {
  const sql = await sqlClient();
  const rows = await sql<MemberRow>`
    select m.clinic_id, m.role, m.doctor_name, c.code, c.name, b.revision, b.snapshot
    from clinic_members m
    join clinics c on c.id = m.clinic_id
    left join clinic_books b on b.clinic_id = m.clinic_id
    where m.user_id = ${userId}
  `;
  return { sql, book: bookFrom(rows[0]), clinicId: rows[0]?.clinic_id ?? null };
}

async function refreshLinks(clinicId: string, snapshot: Snapshot) {
  const sql = await sqlClient();
  for (const patient of snapshot.patients ?? []) {
    if (!patient.portalToken) continue;
    await sql`
      insert into patient_links (token, clinic_id, patient_id)
      values (${patient.portalToken}, ${clinicId}, ${patient.id})
      on conflict (token) do update
      set clinic_id = excluded.clinic_id, patient_id = excluded.patient_id
    `;
  }
}

const files: Record<string, string> = {};

export const readClinicBook = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ClinicBook> => {
    const { book } = await memberOf(context.userId);
    return book;
  });

export const writeClinicBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { revision: number; snapshot: Snapshot }) => data)
  .handler(async ({ context, data }) => {
    const { sql, book, clinicId } = await memberOf(context.userId);
    if (!clinicId || !book.role) return { ok: false as const, ...emptyBook };
    if (!data?.snapshot || typeof data.revision !== "number" || data.revision <= book.revision) {
      return { ok: false as const, ...book };
    }
    const payload = JSON.stringify({ ...data.snapshot, revision: data.revision });
    const saved = await sql<{ revision: number }>`
      insert into clinic_books (clinic_id, revision, snapshot, updated_at)
      values (${clinicId}, ${data.revision}, ${payload}::jsonb, now())
      on conflict (clinic_id) do update
      set revision = excluded.revision, snapshot = excluded.snapshot, updated_at = now()
      where clinic_books.revision < excluded.revision
      returning revision
    `;
    if (!saved.length) {
      const fresh = await memberOf(context.userId);
      return { ok: false as const, ...fresh.book };
    }
    await refreshLinks(clinicId, data.snapshot);
    return { ok: true as const, ...book, revision: data.revision, snapshot: data.snapshot };
  });

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export const createClinic = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string }) => ({ name: String(data?.name ?? "").trim().slice(0, 80) }))
  .handler(async ({ context, data }) => {
    if (!data.name) throw new Error("Escriba el nombre de la clínica.");
    const existing = await memberOf(context.userId);
    if (existing.book.role) return existing.book;
    const sql = existing.sql;
    const id = crypto.randomUUID();
    let code = makeCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clash = await sql<{ code: string }>`select code from clinics where code = ${code}`;
      if (!clash.length) break;
      code = makeCode();
    }
    await sql`insert into clinics (id, code, name) values (${id}, ${code}, ${data.name})`;
    await sql`
      insert into clinic_members (user_id, clinic_id, role, doctor_name)
      values (${context.userId}, ${id}, ${"direccion"}, ${null})
    `;
    await sql`
      insert into clinic_books (clinic_id, revision, snapshot)
      values (${id}, ${0}, ${JSON.stringify({ revision: 0, patients: [] })}::jsonb)
    `;
    return memberOf(context.userId).then((row) => row.book);
  });

export const joinClinic = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string; role: string; doctorName?: string }) => ({
    code: String(data?.code ?? "").trim().toUpperCase(),
    role: data?.role === "medico" ? ("medico" as const) : ("recepcion" as const),
    doctorName: String(data?.doctorName ?? "").trim().slice(0, 80),
  }))
  .handler(async ({ context, data }) => {
    const existing = await memberOf(context.userId);
    if (existing.book.role) return existing.book;
    if (!data.code) throw new Error("Escriba el código de la clínica.");
    if (data.role === "medico" && !data.doctorName) throw new Error("Indique con qué profesional entra.");
    const sql = existing.sql;
    const clinics = await sql<{ id: string }>`select id from clinics where code = ${data.code}`;
    const clinic = clinics[0];
    if (!clinic) throw new Error("Ese código no corresponde a ninguna clínica.");
    await sql`
      insert into clinic_members (user_id, clinic_id, role, doctor_name)
      values (${context.userId}, ${clinic.id}, ${data.role}, ${data.role === "medico" ? data.doctorName : null})
    `;
    return memberOf(context.userId).then((row) => row.book);
  });

export const putClinicFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; dataUrl: string }) => data)
  .handler(async ({ context, data }) => {
    const { book } = await memberOf(context.userId);
    if (!book.role) return { ok: false as const };
    if (!data?.dataUrl || data.dataUrl.length > 2_200_000) return { ok: false as const };
    files[data.id] = data.dataUrl;
    return { ok: true as const };
  });

export const getClinicFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { book } = await memberOf(context.userId);
    if (!book.role) return null;
    return files[data?.id] ?? null;
  });
