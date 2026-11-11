import { hashPassword } from "better-auth/crypto";

const EMAIL = "mundoconfia@gmail.com";
const PASSWORD = "Asexia";
const NAME = "Dirección";

let ready: Promise<void> | null = null;

/** Crea la cuenta de dirección si no existe y la deja siempre como dirección. */
export function ensureAdmin() {
  ready ??= seed().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function seed() {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const hash = await hashPassword(PASSWORD);
  const users = await sql<{ id: string }>`select id from "user" where lower(email) = ${EMAIL}`;
  let userId = users[0]?.id;
  if (!userId) {
    userId = crypto.randomUUID();
    await sql`
      insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
      values (${userId}, ${NAME}, ${EMAIL}, ${true}, now(), now())
    `;
  }
  const accounts = await sql<{ id: string }>`
    select id from "account" where "userId" = ${userId} and "providerId" = ${"credential"}
  `;
  if (!accounts[0]) {
    await sql`
      insert into "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      values (${crypto.randomUUID()}, ${userId}, ${"credential"}, ${userId}, ${hash}, now(), now())
    `;
  } else {
    await sql`
      update "account" set "password" = ${hash}, "updatedAt" = now()
      where "userId" = ${userId} and "providerId" = ${"credential"}
    `;
  }

  const member = await sql<{ clinic_id: string; role: string }>`
    select clinic_id, role from clinic_members where user_id = ${userId}
  `;
  if (member[0]) {
    if (member[0].role !== "direccion") {
      await sql`update clinic_members set role = ${"direccion"}, doctor_name = null where user_id = ${userId}`;
    }
    return;
  }

  const clinics = await sql<{ id: string }>`select id from clinics limit 1`;
  let clinicId = clinics[0]?.id;
  if (!clinicId) {
    clinicId = crypto.randomUUID();
    let code = makeCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clash = await sql<{ code: string }>`select code from clinics where code = ${code}`;
      if (!clash.length) break;
      code = makeCode();
    }
    await sql`insert into clinics (id, code, name) values (${clinicId}, ${code}, ${"AsexiA Castellana"})`;
    await sql`
      insert into clinic_books (clinic_id, revision, snapshot)
      values (${clinicId}, ${0}, ${JSON.stringify({ revision: 0, patients: [] })}::jsonb)
    `;
  }
  await sql`
    insert into clinic_members (user_id, clinic_id, role, doctor_name)
    values (${userId}, ${clinicId}, ${"direccion"}, ${null})
  `;
}
