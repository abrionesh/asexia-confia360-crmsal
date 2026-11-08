import { D as seedCatalog, S as normalizeCatalog, c as applyReply } from "./clinic-BBb0I11m.mjs";
import { n as parseSnapshot } from "./persist-7rEDgaNm.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.functions-C5olbQ_q.js
var SIGNATURE_LIMIT = 2e5;
async function loadLink(token) {
	const { getSql } = await import("./db-DLE_Rhjb.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const row = (await sql`
    select l.clinic_id, l.patient_id, b.revision, b.snapshot, c.name
    from patient_links l
    join clinic_books b on b.clinic_id = l.clinic_id
    join clinics c on c.id = l.clinic_id
    where l.token = ${token}
  `)[0];
	if (!row) return null;
	const snapshot = parseSnapshot(row.snapshot);
	if (!snapshot) return null;
	return {
		sql,
		row,
		snapshot,
		revision: Number(row.revision ?? 0)
	};
}
async function saveBook(clinicId, revision, snapshot) {
	const { getSql } = await import("./db-DLE_Rhjb.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const next = revision + 1;
	return (await sql`
    update clinic_books
    set revision = ${next}, snapshot = ${JSON.stringify({
		...snapshot,
		revision: next
	})}::jsonb, updated_at = now()
    where clinic_id = ${clinicId} and revision = ${revision}
    returning revision
  `).length > 0;
}
function catalogOf(snapshot) {
	return normalizeCatalog(snapshot.catalog ?? seedCatalog());
}
var openPortal_createServerFn_handler = createServerRpc({
	id: "624b6bac1337a080c0530dffb6e7be3020b914cc0d70fe763e7aba2190cd05a1",
	name: "openPortal",
	filename: "src/lib/api/portal.functions.ts"
}, (opts) => openPortal.__executeServer(opts));
var openPortal = createServerFn({ method: "POST" }).validator((data) => ({ token: String(data?.token ?? "").trim() })).handler(openPortal_createServerFn_handler, async ({ data }) => {
	if (!data.token) return null;
	const loaded = await loadLink(data.token);
	if (!loaded) return null;
	const patient = loaded.snapshot.patients.find((item) => item.id === loaded.row.patient_id);
	if (!patient) return null;
	const visit = [...patient.visits ?? []].filter((item) => item.status === "programada").sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())[0];
	return {
		clinicName: loaded.row.name,
		patientName: patient.fullName,
		firstName: patient.firstName,
		consentSigned: Boolean(patient.consentSigned),
		visit: visit ? {
			at: visit.at,
			activityName: visit.activityName,
			professional: visit.professional,
			roomName: visit.roomName,
			confirmation: visit.confirmation ?? "pendiente"
		} : null
	};
});
var patientReply_createServerFn_handler = createServerRpc({
	id: "d11103c522de88aeaac9de1da87ab79fccfc9cf6d92c1a49c4742cf7dd2ebadc",
	name: "patientReply",
	filename: "src/lib/api/portal.functions.ts"
}, (opts) => patientReply.__executeServer(opts));
var patientReply = createServerFn({ method: "POST" }).validator((data) => ({
	token: String(data?.token ?? "").trim(),
	answer: data?.answer === "no-puede" ? "no-puede" : "confirmada"
})).handler(patientReply_createServerFn_handler, async ({ data }) => {
	const loaded = await loadLink(data.token);
	if (!loaded) return {
		ok: false,
		message: "El enlace ya no es válido."
	};
	const result = applyReply({
		patients: loaded.snapshot.patients,
		waitlist: loaded.snapshot.waitlist ?? [],
		catalog: catalogOf(loaded.snapshot),
		patientId: loaded.row.patient_id,
		answer: data.answer
	});
	const snapshot = {
		...loaded.snapshot,
		patients: result.patients,
		waitlist: result.waitlist
	};
	if (!await saveBook(loaded.row.clinic_id, loaded.revision, snapshot)) return {
		ok: false,
		message: "La clínica estaba guardando. Pruebe otra vez."
	};
	return {
		ok: true,
		message: result.message
	};
});
var patientSign_createServerFn_handler = createServerRpc({
	id: "e7a8072d96427befafbd6c49cf64bbc84ab51c32c34d316d211c1783bb421b26",
	name: "patientSign",
	filename: "src/lib/api/portal.functions.ts"
}, (opts) => patientSign.__executeServer(opts));
var patientSign = createServerFn({ method: "POST" }).validator((data) => ({
	token: String(data?.token ?? "").trim(),
	signature: String(data?.signature ?? "")
})).handler(patientSign_createServerFn_handler, async ({ data }) => {
	if (!data.signature.startsWith("data:image/png") || data.signature.length > SIGNATURE_LIMIT) return {
		ok: false,
		message: "La firma no se ha podido guardar."
	};
	const loaded = await loadLink(data.token);
	if (!loaded) return {
		ok: false,
		message: "El enlace ya no es válido."
	};
	const patients = loaded.snapshot.patients.map((patient) => patient.id === loaded.row.patient_id ? {
		...patient,
		consentSigned: true,
		consentSignature: data.signature,
		consentSignedAt: (/* @__PURE__ */ new Date()).toISOString()
	} : patient);
	if (!await saveBook(loaded.row.clinic_id, loaded.revision, {
		...loaded.snapshot,
		patients
	})) return {
		ok: false,
		message: "La clínica estaba guardando. Pruebe otra vez."
	};
	return {
		ok: true,
		message: "Consentimiento firmado."
	};
});
//#endregion
export { openPortal_createServerFn_handler, patientReply_createServerFn_handler, patientSign_createServerFn_handler };
