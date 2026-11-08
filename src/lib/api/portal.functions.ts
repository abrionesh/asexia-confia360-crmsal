import { createServerFn } from "@tanstack/react-start";
import { normalizeCatalog } from "@/lib/catalog";
import { applyReply } from "@/lib/ops";
import { seedCatalog } from "./mock/clinic";
import { parseSnapshot, type Snapshot } from "./persist";

type LinkRow = {
  clinic_id: string;
  patient_id: string;
  revision: number | string;
  snapshot: unknown;
  name: string;
};

const SIGNATURE_LIMIT = 200_000;

async function loadLink(token: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<LinkRow>`
    select l.clinic_id, l.patient_id, b.revision, b.snapshot, c.name
    from patient_links l
    join clinic_books b on b.clinic_id = l.clinic_id
    join clinics c on c.id = l.clinic_id
    where l.token = ${token}
  `;
  const row = rows[0];
  if (!row) return null;
  const snapshot = parseSnapshot(row.snapshot);
  if (!snapshot) return null;
  return { sql, row, snapshot, revision: Number(row.revision ?? 0) };
}

async function saveBook(clinicId: string, revision: number, snapshot: Snapshot) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const next = revision + 1;
  const payload = JSON.stringify({ ...snapshot, revision: next });
  const saved = await sql<{ revision: number }>`
    update clinic_books
    set revision = ${next}, snapshot = ${payload}::jsonb, updated_at = now()
    where clinic_id = ${clinicId} and revision = ${revision}
    returning revision
  `;
  return saved.length > 0;
}

function catalogOf(snapshot: Snapshot) {
  return normalizeCatalog(snapshot.catalog ?? seedCatalog());
}

export const openPortal = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => ({ token: String(data?.token ?? "").trim() }))
  .handler(async ({ data }) => {
    if (!data.token) return null;
    const loaded = await loadLink(data.token);
    if (!loaded) return null;
    const patient = loaded.snapshot.patients.find((item) => item.id === loaded.row.patient_id);
    if (!patient) return null;
    const visit = [...(patient.visits ?? [])]
      .filter((item) => item.status === "programada")
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())[0];
    return {
      clinicName: loaded.row.name,
      patientName: patient.fullName,
      firstName: patient.firstName,
      consentSigned: Boolean(patient.consentSigned),
      visit: visit
        ? {
            at: visit.at,
            activityName: visit.activityName,
            professional: visit.professional,
            roomName: visit.roomName,
            confirmation: visit.confirmation ?? "pendiente",
          }
        : null,
    };
  });

export const patientReply = createServerFn({ method: "POST" })
  .validator((data: { token: string; answer: "confirmada" | "no-puede" }) => ({
    token: String(data?.token ?? "").trim(),
    answer: data?.answer === "no-puede" ? ("no-puede" as const) : ("confirmada" as const),
  }))
  .handler(async ({ data }) => {
    const loaded = await loadLink(data.token);
    if (!loaded) return { ok: false as const, message: "El enlace ya no es válido." };
    const result = applyReply({
      patients: loaded.snapshot.patients,
      waitlist: loaded.snapshot.waitlist ?? [],
      catalog: catalogOf(loaded.snapshot),
      patientId: loaded.row.patient_id,
      answer: data.answer,
    });
    const snapshot: Snapshot = { ...loaded.snapshot, patients: result.patients, waitlist: result.waitlist };
    const saved = await saveBook(loaded.row.clinic_id, loaded.revision, snapshot);
    if (!saved) return { ok: false as const, message: "La clínica estaba guardando. Pruebe otra vez." };
    return { ok: true as const, message: result.message };
  });

export const patientSign = createServerFn({ method: "POST" })
  .validator((data: { token: string; signature: string }) => ({
    token: String(data?.token ?? "").trim(),
    signature: String(data?.signature ?? ""),
  }))
  .handler(async ({ data }) => {
    if (!data.signature.startsWith("data:image/png") || data.signature.length > SIGNATURE_LIMIT) {
      return { ok: false as const, message: "La firma no se ha podido guardar." };
    }
    const loaded = await loadLink(data.token);
    if (!loaded) return { ok: false as const, message: "El enlace ya no es válido." };
    const patients = loaded.snapshot.patients.map((patient) =>
      patient.id === loaded.row.patient_id
        ? {
            ...patient,
            consentSigned: true,
            consentSignature: data.signature,
            consentSignedAt: new Date().toISOString(),
          }
        : patient,
    );
    const saved = await saveBook(loaded.row.clinic_id, loaded.revision, { ...loaded.snapshot, patients });
    if (!saved) return { ok: false as const, message: "La clínica estaba guardando. Pruebe otra vez." };
    return { ok: true as const, message: "Consentimiento firmado." };
  });
