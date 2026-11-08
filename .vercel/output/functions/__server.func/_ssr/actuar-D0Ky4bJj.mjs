import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useUiStore, l as api, p as formatMoney, s as PIPELINE_STAGES } from "./router-OxFF0fHE.mjs";
import { i as occupancy, o as startOfDay, t as addDays } from "./occupancy-C2b47X8l.mjs";
import { t as Skeleton } from "./skeleton-CM610tTB.mjs";
import { t as AlarmStack } from "./queue-BLd9q_cI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actuar-D0Ky4bJj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SURGICAL = /* @__PURE__ */ new Set([
	"rino",
	"blefaro",
	"implantes"
]);
function buildPredictions(patients, catalog, now = /* @__PURE__ */ new Date()) {
	const items = [];
	const tomorrow = addDays(startOfDay(now), 1);
	const day = occupancy(patients, catalog, tomorrow);
	if (!day.closed && day.capacity > 0 && day.ratio < .35) items.push({
		id: "hueco",
		title: "Hueco en la agenda de mañana",
		reason: `${Math.round(day.ratio * 100)}% de ocupación. Quedan ${Math.max(0, day.capacity - day.booked)} minutos libres.`,
		to: "/agenda"
	});
	for (const patient of patients) {
		if (patient.stage === "lost") continue;
		const visits = patient.visits ?? [];
		const upcoming = visits.filter((visit) => visit.status === "programada" && new Date(visit.at).getTime() > now.getTime());
		const idleDays = (now.getTime() - new Date(patient.lastActivityAt).getTime()) / 864e5;
		const stage = PIPELINE_STAGES.find((item) => item.id === patient.stage)?.label ?? patient.stage;
		if (visits.some((visit) => visit.status === "ausente") && upcoming.length > 0) items.push({
			id: `noshow-${patient.id}`,
			title: "Riesgo de no asistencia",
			reason: `${patient.fullName} ya faltó a una cita y tiene otra prevista.`,
			patientId: patient.id
		});
		if ((patient.stage === "new" || patient.stage === "qualified" || patient.stage === "proposal") && idleDays >= 3) items.push({
			id: `frio-${patient.id}`,
			title: "Lead enfriándose",
			reason: `${patient.fullName} lleva ${Math.floor(idleDays)} días en ${stage} sin movimiento.`,
			patientId: patient.id
		});
		if (patient.stage === "proposal" && patient.estimatedValue >= 3e3 && idleDays >= 2) items.push({
			id: `ticket-${patient.id}`,
			title: "Presupuesto alto parado",
			reason: `${patient.fullName} · ${formatMoney(patient.estimatedValue)} sigue en propuesta.`,
			patientId: patient.id
		});
		for (const payment of patient.payments ?? []) {
			if (payment.status !== "pendiente") continue;
			const due = new Date(payment.dueAt).getTime();
			if (due > now.getTime() + 1728e5) continue;
			items.push({
				id: `pay-${payment.id}`,
				title: due < now.getTime() ? "Cobro vencido" : "Cobro a punto de vencer",
				reason: `${patient.fullName} · ${payment.concept} · ${formatMoney(payment.amount)}`,
				patientId: patient.id
			});
		}
		if (!patient.consentSigned && upcoming.some((visit) => SURGICAL.has(visit.activityId))) items.push({
			id: `consent-${patient.id}`,
			title: "Falta el consentimiento",
			reason: `${patient.fullName} tiene una cirugía prevista y la ficha no está firmada.`,
			patientId: patient.id
		});
		const done = visits.filter((visit) => visit.status === "realizada").sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
		if (done && upcoming.length === 0 && done.activityId !== "revision" && now.getTime() - new Date(done.at).getTime() > 12096e5) items.push({
			id: `review-${patient.id}`,
			title: "Revisión sin programar",
			reason: `${patient.fullName} terminó ${done.activityName} y no tiene otra cita.`,
			patientId: patient.id
		});
	}
	return items;
}
var MODES = [
	["actuar", "Actuar"],
	["alarmas", "Alarmas"],
	["predicciones", "Predicciones"]
];
var DAY = 864e5;
var BIRTHDAY = 7 * DAY;
function ActuarHub() {
	const role = useUiStore((state) => state.role);
	const doctor = useUiStore((state) => state.doctor);
	const [mode, setMode] = (0, import_react.useState)("actuar");
	const alarms = useQuery({
		queryKey: ["alarms", "all"],
		queryFn: () => api.listOpenAlarms()
	});
	const pipeline = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => api.listPipeline()
	});
	const catalog = useQuery({
		queryKey: ["catalog"],
		queryFn: () => api.getCatalog()
	});
	const loading = alarms.isPending || pipeline.isPending || catalog.isPending;
	const people = pipeline.data ?? [];
	const visiblePeople = role === "medico" ? people.filter((patient) => owns(patient, doctor)) : people;
	const visibleIds = new Set(visiblePeople.map((patient) => patient.id));
	const list = (alarms.data ?? []).filter((alarm) => role !== "medico" || visibleIds.has(alarm.patientId));
	const now = Date.now();
	const dueSoon = list.filter((alarm) => isActionable(alarm, now));
	const later = list.filter((alarm) => !isActionable(alarm, now));
	const predictions = pipeline.data && catalog.data ? buildPredictions(visiblePeople, catalog.data).filter((item) => !item.patientId || visibleIds.has(item.patientId)) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-kicker",
					children: "Actuar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight text-ink",
					children: "Qué hay que hacer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-ink-muted",
					children: "Lo urgente, las alarmas que vienen y lo que el historial deja prever. El tablero se queda para mover fichas."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto",
				children: MODES.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode(id),
					className: `h-10 shrink-0 rounded-full px-3 text-sm font-medium ${mode === id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`,
					children: [
						label,
						id === "actuar" ? ` · ${loading ? "…" : dueSoon.length}` : "",
						id === "predicciones" ? ` · ${loading ? "…" : predictions.length}` : ""
					]
				}, id))
			}),
			loading || !catalog.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-36 rounded-xl" }) : mode === "actuar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmStack, {
				alarms: dueSoon,
				layout: "stack",
				empty: "Nada que actuar ahora. Las citas lejanas están en Alarmas."
			}) : mode === "alarmas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlarmStack, {
				alarms: later,
				layout: "stack",
				empty: "No hay alarmas más allá de lo que ya está en Actuar."
			}) : predictions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-surface px-4 py-6 text-sm text-ink-muted shadow-border",
				children: "Sin señales nuevas."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: predictions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl bg-surface p-4 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-ink",
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-ink-muted",
							children: item.reason
						}),
						item.patientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pacientes/$id",
							params: { id: item.patientId },
							className: "mt-2 inline-flex h-10 items-center text-sm font-medium text-accent",
							children: "Abrir ficha"
						}) : item.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: "mt-2 inline-flex h-10 items-center text-sm font-medium text-accent",
							children: "Ver"
						}) : null
					]
				}, item.id))
			})
		]
	});
}
function isActionable(alarm, now) {
	const due = new Date(alarm.dueAt).getTime();
	const window = alarm.kind === "birthday" ? BIRTHDAY : DAY;
	return alarm.status === "due" || due <= now + window;
}
function owns(patient, doctor) {
	if (!doctor) return true;
	if (patient.assignedTo === doctor) return true;
	return (patient.visits ?? []).some((visit) => visit.professional === doctor);
}
var SplitComponent = ActuarHub;
//#endregion
export { SplitComponent as component };
