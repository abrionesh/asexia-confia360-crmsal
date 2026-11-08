import { n as parseSnapshot } from "./persist-7rEDgaNm.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DflcjHIl.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book.functions-BVozupv_.js
var emptyBook = {
	revision: 0,
	snapshot: null,
	role: null,
	code: null,
	name: null,
	doctorName: null
};
function asRole(value) {
	if (value === "direccion" || value === "recepcion" || value === "medico") return value;
	return null;
}
function bookFrom(row) {
	if (!row) return emptyBook;
	const revision = Number(row.revision ?? 0);
	return {
		revision: Number.isFinite(revision) ? revision : 0,
		snapshot: parseSnapshot(row.snapshot),
		role: asRole(row.role),
		code: row.code,
		name: row.name,
		doctorName: row.doctor_name
	};
}
async function sqlClient() {
	const { getSql } = await import("./db-DLE_Rhjb.mjs").then((n) => n.t).then((n) => n.t);
	return getSql();
}
async function memberOf(userId) {
	const sql = await sqlClient();
	const rows = await sql`
    select m.clinic_id, m.role, m.doctor_name, c.code, c.name, b.revision, b.snapshot
    from clinic_members m
    join clinics c on c.id = m.clinic_id
    left join clinic_books b on b.clinic_id = m.clinic_id
    where m.user_id = ${userId}
  `;
	return {
		sql,
		book: bookFrom(rows[0]),
		clinicId: rows[0]?.clinic_id ?? null
	};
}
async function refreshLinks(clinicId, snapshot) {
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
var files = {};
var readClinicBook_createServerFn_handler = createServerRpc({
	id: "1a97e30eedbe6a93ed92087bf2d7a0c65bf7ed320f59fa3d024629d48e0373d2",
	name: "readClinicBook",
	filename: "src/lib/api/book.functions.ts"
}, (opts) => readClinicBook.__executeServer(opts));
var readClinicBook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(readClinicBook_createServerFn_handler, async ({ context }) => {
	const { book } = await memberOf(context.userId);
	return book;
});
var writeClinicBook_createServerFn_handler = createServerRpc({
	id: "229e3ee0b15f279d288bffdaf9ffabc69aa1d35e4025ab269dd740c4343cf95c",
	name: "writeClinicBook",
	filename: "src/lib/api/book.functions.ts"
}, (opts) => writeClinicBook.__executeServer(opts));
var writeClinicBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(writeClinicBook_createServerFn_handler, async ({ context, data }) => {
	const { sql, book, clinicId } = await memberOf(context.userId);
	if (!clinicId || !book.role) return {
		ok: false,
		...emptyBook
	};
	if (!data?.snapshot || typeof data.revision !== "number" || data.revision <= book.revision) return {
		ok: false,
		...book
	};
	const payload = JSON.stringify({
		...data.snapshot,
		revision: data.revision
	});
	if (!(await sql`
      insert into clinic_books (clinic_id, revision, snapshot, updated_at)
      values (${clinicId}, ${data.revision}, ${payload}::jsonb, now())
      on conflict (clinic_id) do update
      set revision = excluded.revision, snapshot = excluded.snapshot, updated_at = now()
      where clinic_books.revision < excluded.revision
      returning revision
    `).length) return {
		ok: false,
		...(await memberOf(context.userId)).book
	};
	await refreshLinks(clinicId, data.snapshot);
	return {
		ok: true,
		...book,
		revision: data.revision,
		snapshot: data.snapshot
	};
});
function makeCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(6));
	return Array.from(bytes, (byte) => alphabet[byte % 32]).join("");
}
var createClinic_createServerFn_handler = createServerRpc({
	id: "ea1dde351396f1f511bb1bfa630fc800d330535ff8bfa81b5a62ca5cbde3616d",
	name: "createClinic",
	filename: "src/lib/api/book.functions.ts"
}, (opts) => createClinic.__executeServer(opts));
var createClinic = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({ name: String(data?.name ?? "").trim().slice(0, 80) })).handler(createClinic_createServerFn_handler, async ({ context, data }) => {
	if (!data.name) throw new Error("Escriba el nombre de la clínica.");
	const existing = await memberOf(context.userId);
	if (existing.book.role) return existing.book;
	const sql = existing.sql;
	const id = crypto.randomUUID();
	let code = makeCode();
	for (let attempt = 0; attempt < 5; attempt += 1) {
		if (!(await sql`select code from clinics where code = ${code}`).length) break;
		code = makeCode();
	}
	await sql`insert into clinics (id, code, name) values (${id}, ${code}, ${data.name})`;
	await sql`
      insert into clinic_members (user_id, clinic_id, role, doctor_name)
      values (${context.userId}, ${id}, ${"direccion"}, ${null})
    `;
	await sql`
      insert into clinic_books (clinic_id, revision, snapshot)
      values (${id}, ${0}, ${JSON.stringify({
		revision: 0,
		patients: []
	})}::jsonb)
    `;
	return memberOf(context.userId).then((row) => row.book);
});
var joinClinic_createServerFn_handler = createServerRpc({
	id: "2fd2848234c6454ac3c9134ffc8fa5ed82c436cf98233999088b81cc8f4dbb7c",
	name: "joinClinic",
	filename: "src/lib/api/book.functions.ts"
}, (opts) => joinClinic.__executeServer(opts));
var joinClinic = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({
	code: String(data?.code ?? "").trim().toUpperCase(),
	role: data?.role === "medico" ? "medico" : "recepcion",
	doctorName: String(data?.doctorName ?? "").trim().slice(0, 80)
})).handler(joinClinic_createServerFn_handler, async ({ context, data }) => {
	const existing = await memberOf(context.userId);
	if (existing.book.role) return existing.book;
	if (!data.code) throw new Error("Escriba el código de la clínica.");
	if (data.role === "medico" && !data.doctorName) throw new Error("Indique con qué profesional entra.");
	const sql = existing.sql;
	const clinic = (await sql`select id from clinics where code = ${data.code}`)[0];
	if (!clinic) throw new Error("Ese código no corresponde a ninguna clínica.");
	await sql`
      insert into clinic_members (user_id, clinic_id, role, doctor_name)
      values (${context.userId}, ${clinic.id}, ${data.role}, ${data.role === "medico" ? data.doctorName : null})
    `;
	return memberOf(context.userId).then((row) => row.book);
});
var putClinicFile_createServerFn_handler = createServerRpc({
	id: "2eccdd92cc079a8e664fe17ddfee46a7c423916129d39450d4bdf16e8d28baca",
	name: "putClinicFile",
	filename: "src/lib/api/book.functions.ts"
}, (opts) => putClinicFile.__executeServer(opts));
var putClinicFile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(putClinicFile_createServerFn_handler, async ({ context, data }) => {
	const { book } = await memberOf(context.userId);
	if (!book.role) return { ok: false };
	if (!data?.dataUrl || data.dataUrl.length > 22e5) return { ok: false };
	files[data.id] = data.dataUrl;
	return { ok: true };
});
var getClinicFile_createServerFn_handler = createServerRpc({
	id: "465c5414d1ffdf700936ec30166ca5191aaf1953c64dc05b2b2896e098b3d117",
	name: "getClinicFile",
	filename: "src/lib/api/book.functions.ts"
}, (opts) => getClinicFile.__executeServer(opts));
var getClinicFile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(getClinicFile_createServerFn_handler, async ({ context, data }) => {
	const { book } = await memberOf(context.userId);
	if (!book.role) return null;
	return files[data?.id] ?? null;
});
//#endregion
export { createClinic_createServerFn_handler, getClinicFile_createServerFn_handler, joinClinic_createServerFn_handler, putClinicFile_createServerFn_handler, readClinicBook_createServerFn_handler, writeClinicBook_createServerFn_handler };
