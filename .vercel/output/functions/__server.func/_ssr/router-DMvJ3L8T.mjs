import { i as __toESM } from "../_runtime.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useNavigate, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Slot, o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as TriangleAlert, c as Send, d as Mic, g as Download, l as Search, n as WifiOff, o as Square, r as Volume2, s as Sparkles, t as X } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { r as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-0IEiKn7-.js
/**
* Domain contract for AsexiA Suite 360.
*
* UI components depend only on these types + `api` in `./client`.
* Swap the mock client for REST or Odoo XML-RPC without touching views.
*/
var PIPELINE_STAGES = [
	{
		id: "new",
		label: "Nuevo Contacto",
		hint: "Entrada"
	},
	{
		id: "qualified",
		label: "Cualificado por IA",
		hint: "Score alto"
	},
	{
		id: "proposal",
		label: "Propuesta",
		hint: "Presupuesto"
	},
	{
		id: "confirmed",
		label: "Cita Confirmada",
		hint: "Agenda"
	},
	{
		id: "followup",
		label: "Seguimiento",
		hint: "Cuidados"
	},
	{
		id: "invoiced",
		label: "Facturado",
		hint: "Cierre"
	},
	{
		id: "lost",
		label: "Perdido",
		hint: "No insistir"
	}
];
function stageMeta(id) {
	return PIPELINE_STAGES.find((stage) => stage.id === id) ?? PIPELINE_STAGES[0];
}
var HOUR = 36e5;
var DAY = 24 * HOUR;
/**
* Alarms are derived from the file, not typed by hand.
* A stage only opens the rule; the file (cita, cuidados, silencio) decides if it fires.
*/
function buildAlarms(patients, now = Date.now()) {
	return patients.flatMap((patient) => alarmsFor(patient, now));
}
function alarmsFor(patient, now) {
	if (patient.stage === "lost") return [];
	const list = [];
	const silence = silenceAlarm(patient, now);
	if (silence) list.push(silence);
	const reminder = reminderAlarm(patient, now);
	if (reminder) list.push(reminder);
	for (const item of patient.care ?? []) {
		const alarm = careAlarm(patient, item, now);
		if (alarm) list.push(alarm);
	}
	for (const payment of patient.payments ?? []) {
		const alarm = paymentAlarm(patient, payment, now);
		if (alarm) list.push(alarm);
	}
	const birthday = birthdayAlarm(patient, now);
	if (birthday) list.push(birthday);
	for (const manual of patient.manualAlarms ?? []) list.push(customAlarm(patient, manual, now));
	const satisfaction = satisfactionAlarm(patient, now);
	if (satisfaction) list.push(satisfaction);
	return list;
}
function silenceAlarm(patient, now) {
	const limit = silenceAfter(patient.stage);
	if (limit == null) return null;
	const idle = now - new Date(patient.lastActivityAt).getTime();
	if (idle < limit) return null;
	const days = Math.max(1, Math.round(idle / DAY));
	const channel = channelFor(patient);
	const reason = patient.stage === "proposal" ? `Propuesta sin respuesta desde hace ${days} día${days === 1 ? "" : "s"}.` : patient.stage === "new" ? `Primer contacto superado (${Math.round(limit / HOUR)} h) sin respuesta.` : `Cualificado sin avance desde hace ${Math.round(idle / HOUR)} h.`;
	return {
		id: `silence:${patient.id}`,
		patientId: patient.id,
		patientName: patient.fullName,
		phone: patient.phone,
		email: patient.email,
		kind: "silence",
		channel,
		status: "due",
		dueAt: new Date(new Date(patient.lastActivityAt).getTime() + limit).toISOString(),
		title: channel === "internal" ? "Llamar, no escribir" : "Reenganche",
		reason: channel === "internal" ? `${reason} La ficha indica que prefiere llamada.` : reason,
		draft: channel === "internal" ? `Llamar a ${patient.fullName} (${patient.phone}). ${patient.notes}` : `Hola ${patient.firstName}, le escribimos de AsexiA Castellana por ${patient.treatmentInterest.toLowerCase()}. ${patient.stage === "proposal" ? "El presupuesto sigue vigente. ¿Quiere que reservemos un hueco de valoración esta semana?" : "Tenemos hueco de valoración esta semana. ¿Prefiere una tarde o un mediodía?"}`
	};
}
function reminderAlarm(patient, now) {
	if (patient.stage !== "confirmed" || !patient.appointmentAt) return null;
	const at = new Date(patient.appointmentAt).getTime();
	const delta = at - now;
	if (delta < -2 * HOUR) return null;
	const dueAt = at - 24 * HOUR;
	const when = new Intl.DateTimeFormat("es-ES", {
		weekday: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(at));
	const soon = delta <= 2 * HOUR;
	return {
		id: `appt:${patient.id}`,
		patientId: patient.id,
		patientName: patient.fullName,
		phone: patient.phone,
		email: patient.email,
		kind: "reminder",
		channel: channelFor(patient),
		status: dueAt <= now ? "due" : "scheduled",
		dueAt: new Date(dueAt).toISOString(),
		title: soon ? "Cita en menos de 2 h" : "Recordatorio de cita",
		reason: soon ? "La cita es inminente y no consta confirmación del recordatorio." : dueAt <= now ? "Cita confirmada dentro de las próximas 48 h." : "Recordatorio programado 24 h antes de la cita.",
		draft: `Hola ${patient.firstName}, le recordamos su cita de ${patient.treatmentInterest.toLowerCase()} el ${when} con ${patient.assignedTo} en AsexiA Castellana. Si no puede acudir, responda a este mensaje.`
	};
}
function careAlarm(patient, item, now) {
	const delta = new Date(item.dueAt).getTime() - now;
	const kind = item.kind === "prep" ? "prep" : item.kind === "aftercare" ? "aftercare" : item.kind === "review" ? "review" : "nurture";
	const channel = channelFor(patient);
	return {
		id: `care:${item.id}`,
		patientId: patient.id,
		patientName: patient.fullName,
		phone: patient.phone,
		email: patient.email,
		kind,
		channel,
		status: delta <= 0 ? "due" : "scheduled",
		dueAt: item.dueAt,
		title: item.title,
		reason: careReason(item.kind),
		draft: draftFor(patient, item)
	};
}
function careReason(kind) {
	if (kind === "prep") return "La ficha indica una preparación previa al tratamiento.";
	if (kind === "aftercare") return "La ficha indica un consejo de cuidado posterior.";
	if (kind === "review") return "La ficha marca una fecha de revisión o siguiente fase.";
	return "La ficha indica un seguimiento comercial al cerrar el plan.";
}
function draftFor(patient, item) {
	const hello = `Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`;
	if (item.kind === "prep") return `${hello} Antes de ${patient.treatmentInterest.toLowerCase()}: ${item.body}`;
	if (item.kind === "aftercare") return `${hello} Sobre ${patient.treatmentInterest.toLowerCase()}: ${item.body} Si nota dolor intenso, sangrado o fiebre, llámenos.`;
	if (item.kind === "review") return `${hello} Toca la revisión de ${patient.treatmentInterest.toLowerCase()}. ${item.body} ¿Le va bien esta semana?`;
	return `${hello} ${item.body}`;
}
function silenceAfter(stage) {
	if (stage === "new") return 4 * HOUR;
	if (stage === "qualified") return 6 * HOUR;
	if (stage === "proposal") return 2 * DAY;
	return null;
}
function channelFor(patient) {
	if (patient.preferredChannel === "call") return "internal";
	if (patient.preferredChannel === "email") return "email";
	return "whatsapp";
}
function paymentAlarm(patient, payment, now) {
	if (payment.status !== "pendiente") return null;
	const delta = new Date(payment.dueAt).getTime() - now;
	if (delta > 48 * HOUR || delta < -7 * DAY) return null;
	const amount = new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0
	}).format(payment.amount);
	return {
		id: `pay:${payment.id}`,
		patientId: patient.id,
		patientName: patient.fullName,
		phone: patient.phone,
		email: patient.email,
		kind: "payment",
		channel: channelFor(patient),
		status: delta <= 0 ? "due" : "scheduled",
		dueAt: payment.dueAt,
		title: `Cobro · ${payment.concept}`,
		reason: delta <= 0 ? "Hay un pago vencido en el plan." : "Hay un pago previsto en las próximas 48 h.",
		draft: `Hola ${patient.firstName}, le escribimos de AsexiA Castellana para el pago de ${amount} (${payment.concept}). ¿Lo dejamos resuelto en la próxima visita?`
	};
}
function birthdayAlarm(patient, now) {
	if (!patient.birthday) return null;
	const [, month, day] = patient.birthday.split("-").map(Number);
	if (!month || !day) return null;
	const today = new Date(now);
	const next = new Date(today.getFullYear(), month - 1, day);
	if (next.getTime() + DAY < now) next.setFullYear(today.getFullYear() + 1);
	const delta = next.getTime() - now;
	if (delta < 0 || delta > 7 * DAY) return null;
	const days = Math.max(0, Math.round(delta / DAY));
	return {
		id: `bday:${patient.id}:${next.getFullYear()}`,
		patientId: patient.id,
		patientName: patient.fullName,
		phone: patient.phone,
		email: patient.email,
		kind: "birthday",
		channel: channelFor(patient),
		status: "scheduled",
		dueAt: next.toISOString(),
		title: days === 0 ? "Cumpleaños hoy" : `Cumpleaños en ${days} día${days === 1 ? "" : "s"}`,
		reason: "La ficha tiene fecha de nacimiento y el cumpleaños cae esta semana.",
		draft: `Hola ${patient.firstName}, desde AsexiA Castellana le deseamos un feliz cumpleaños. Quedamos a su disposición cuando quiera.`
	};
}
function customAlarm(patient, manual, now) {
	const due = new Date(manual.dueAt).getTime();
	return {
		id: `manual:${manual.id}`,
		patientId: patient.id,
		patientName: patient.fullName,
		phone: patient.phone,
		email: patient.email,
		kind: "custom",
		channel: manual.channel,
		status: due <= now ? "due" : "scheduled",
		dueAt: manual.dueAt,
		title: manual.title,
		reason: "Alarma creada a mano desde la ficha.",
		draft: manual.draft
	};
}
function satisfactionAlarm(patient, now) {
	if (patient.satisfaction) return null;
	if ((patient.visits ?? []).filter((visit) => visit.status === "realizada" && now - new Date(visit.at).getTime() > 48 * HOUR).length === 0) return null;
	return {
		id: `sat:${patient.id}`,
		patientId: patient.id,
		patientName: patient.fullName,
		phone: patient.phone,
		email: patient.email,
		kind: "satisfaction",
		channel: "internal",
		status: "due",
		dueAt: new Date(now).toISOString(),
		title: "¿Cómo se encuentra?",
		reason: "Han pasado más de 48 h de una visita y la ficha no tiene respuesta.",
		draft: `Una sola pregunta para ${patient.fullName}: bien, regular o mal.`
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatMoney(value) {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0
	}).format(value);
}
function initials(name) {
	return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
function uid() {
	return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function openingMessage() {
	return {
		id: "msg-open",
		role: "assistant",
		content: "Soy el Copiloto de AsexiA. Puedo resumir el pipeline, preparar el briefing de un paciente o redactar el siguiente WhatsApp. ¿Por dónde empezamos?",
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function copilotReply(prompt, patients) {
	const q = prompt.toLowerCase();
	const byStage = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.id, patients.filter((patient) => patient.stage === stage.id)]));
	const pipelineValue = patients.filter((patient) => patient.stage !== "invoiced" && !patient.billed).reduce((sum, patient) => sum + patient.estimatedValue, 0);
	const closedPatients = patients.filter((patient) => patient.stage === "invoiced" || patient.billed);
	const closed = closedPatients.reduce((sum, patient) => sum + patient.estimatedValue, 0);
	const cold = patients.filter((patient) => {
		const ageH = (Date.now() - new Date(patient.lastActivityAt).getTime()) / 36e5;
		return patient.stage === "new" && ageH > 4;
	});
	let content;
	if (/pipeline|resumen|hoy|tablero/.test(q)) content = [
		`Pipeline vivo: ${patients.length} fichas · ${formatMoney(pipelineValue)} en juego.`,
		`Nuevos ${byStage.new.length} · Cualificados ${byStage.qualified.length} · Propuesta ${byStage.proposal.length} · Cita ${byStage.confirmed.length} · Seguimiento ${byStage.followup.length} · Facturado ${byStage.invoiced.length} (${formatMoney(closed)}).`,
		`Prioridad: ${byStage.qualified[0]?.fullName ?? "sin cualificados"} y ${byStage.new[0]?.fullName ?? "—"}. Si quiere, preparo el briefing de cualquiera.`
	].join("\n\n");
	else if (/frí|sin respuesta|fria|frio|nurturing/.test(q)) content = cold.length === 0 ? "No hay leads nuevos con más de 4 h sin respuesta. El SLA de primer contacto se está cumpliendo." : `Leads fríos (nuevo contacto, >4 h):\n${cold.map((patient) => `· ${patient.fullName} · ${patient.treatmentInterest} · ${patient.nextAction ?? "sin acción"}`).join("\n")}\n\nPuedo redactar el WhatsApp de reenganche.`;
	else if (/factur|previsi|ticket|cierre/.test(q)) {
		const avg = closedPatients.length === 0 ? 0 : closed / closedPatients.length;
		content = `Cierre del periodo: ${formatMoney(closed)} en ${closedPatients.length} casos cobrados. Ticket medio ${formatMoney(avg)}. Si avanzan Elena Ruiz y Pablo Herrero este mes, la previsión suma ${formatMoney(11400)} adicionales.`;
	} else if (/whatsapp|mensaje|redact/.test(q)) {
		const target = patients.find((patient) => q.includes(patient.firstName.toLowerCase())) ?? byStage.new[0];
		content = target ? `Borrador para ${target.fullName} (${target.treatmentInterest}):\n\n«Hola ${target.firstName}, le escribe AsexiA Castellana. Tenemos un hueco de valoración esta semana para ${target.treatmentInterest.toLowerCase()}. ¿Prefiere tarde el jueves o mediodía el viernes?»\n\nTono: clínico, sin emojis, SLA < 1 h.` : "Indíqueme el paciente y redacto el WhatsApp en tono clínico.";
	} else if (/briefing|prepar|llamad|elena|pablo|lucía|lucia|isabel/.test(q)) {
		const target = patients.find((patient) => q.includes(patient.firstName.toLowerCase())) ?? patients.find((patient) => patient.id === "elena-ruiz") ?? patients[0];
		content = [
			`Briefing · ${target.fullName}`,
			`${target.treatmentInterest} · ${formatMoney(target.estimatedValue)} · ${target.stage === "qualified" ? `IA ${target.aiScore}` : stageLabel$1(target)}`,
			`Contacto: ${target.phone} · ${target.city}`,
			`Notas: ${target.notes}`,
			`Siguiente acción: ${target.nextAction ?? "—"}`,
			`Ángulo de llamada: no vender quirófano; confirmar motivación, ventana temporal y objeción de precio. Cerrar hueco concreto.`
		].join("\n");
	} else if (/alarma|recordatorio|seguimiento|cuidados/.test(q)) {
		const due = buildAlarms(patients).filter((alarm) => alarm.status === "due");
		content = due.length === 0 ? "No hay alarmas vencidas. Las citas a más de 48 h y los cuidados futuros siguen programados en la ficha." : `Alarmas para actuar ahora (${due.length}):\n${due.map((alarm) => `· ${alarm.patientName} — ${alarm.title}. ${alarm.reason}`).join("\n")}\n\nDesde la ficha puede enviar el WhatsApp o el correo ya redactado.`;
	} else if (/cita|agenda|jueves|martes/.test(q)) content = byStage.confirmed.map((patient) => `· ${patient.fullName} — ${patient.treatmentInterest} · ${patient.assignedTo} · ${patient.nextAction}`).join("\n") || "No hay citas confirmadas en el tablero.";
	else content = "Puedo ayudarle con: resumen del pipeline, leads fríos, briefing de un paciente, previsión de facturación o un borrador de WhatsApp. Escriba el nombre o la tarea.";
	return {
		id: uid(),
		role: "assistant",
		content,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function stageLabel$1(patient) {
	return PIPELINE_STAGES.find((stage) => stage.id === patient.stage)?.label ?? patient.stage;
}
/** Relative timestamps so the demo always feels current. */
function hoursAgo(hours) {
	return (/* @__PURE__ */ new Date(Date.now() - hours * 36e5)).toISOString();
}
function minutesAgo(minutes) {
	return (/* @__PURE__ */ new Date(Date.now() - minutes * 6e4)).toISOString();
}
function daysAgo(days) {
	return (/* @__PURE__ */ new Date(Date.now() - days * 864e5)).toISOString();
}
function hoursFromNow(hours) {
	return new Date(Date.now() + hours * 36e5).toISOString();
}
function wait(ms = 640) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
var CLINIC_NAME = "AsexiA Castellana";
var seedPatients = [
	{
		id: "lucia-mendoza",
		firstName: "Lucía",
		lastName: "Mendoza",
		fullName: "Lucía Mendoza",
		phone: "+34 612 448 901",
		email: "lucia.mendoza@correo.es",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Harmonización facial",
		estimatedValue: 2400,
		source: "Instagram",
		stage: "new",
		assignedTo: "Raquel Vidal",
		lastActivityAt: minutesAgo(38),
		createdAt: hoursAgo(5),
		tags: ["IG Ads", "Alta intención"],
		notes: "Preguntó por resultados de pómulos. Quiere cita en horario de tarde.",
		nextAction: "Responder WhatsApp en < 1 h"
	},
	{
		id: "javier-ortega",
		firstName: "Javier",
		lastName: "Ortega",
		fullName: "Javier Ortega",
		phone: "+34 609 112 334",
		email: "j.ortega@litoralmail.com",
		city: "Pozuelo",
		clinic: CLINIC_NAME,
		treatmentInterest: "Implantes dentales",
		estimatedValue: 6800,
		source: "Google Ads",
		stage: "new",
		assignedTo: "Raquel Vidal",
		lastActivityAt: hoursAgo(2),
		createdAt: hoursAgo(9),
		tags: ["Ticket alto", "SEO"],
		notes: "Solicitó financiación a 12 meses. No ha facilitado ortopantomografía.",
		nextAction: "Pedir estudio radiológico"
	},
	{
		id: "sofia-navarro",
		firstName: "Sofía",
		lastName: "Navarro",
		fullName: "Sofía Navarro",
		phone: "+34 655 009 218",
		email: "sofia.navarro@icloud.com",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Láser CO2",
		estimatedValue: 1250,
		source: "WhatsApp",
		stage: "new",
		assignedTo: "Clara Méndez",
		lastActivityAt: hoursAgo(1),
		createdAt: hoursAgo(4),
		tags: ["Cicatriz", "Urgente"],
		notes: "Quiere tratar cicatriz post-acné antes de una boda en octubre.",
		nextAction: "Enviar protocolo y disponibilidad"
	},
	{
		id: "martin-vega",
		firstName: "Martín",
		lastName: "Vega",
		fullName: "Martín Vega",
		phone: "+34 622 781 440",
		email: "martin.vega@proton.me",
		city: "Alcobendas",
		clinic: CLINIC_NAME,
		treatmentInterest: "Invisalign",
		estimatedValue: 4200,
		source: "Referral",
		stage: "new",
		assignedTo: "Raquel Vidal",
		lastActivityAt: hoursAgo(7),
		createdAt: daysAgo(1),
		tags: ["Derivado", "Ortodoncia"],
		notes: "Derivado por la Dra. Pellicer. Prefiere llamadas, no WhatsApp.",
		preferredChannel: "call",
		nextAction: "Llamada de cualificación"
	},
	{
		id: "elena-ruiz",
		firstName: "Elena",
		lastName: "Ruiz",
		fullName: "Elena Ruiz",
		phone: "+34 616 903 552",
		email: "elena.ruiz.s@outlook.com",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Blefaroplastia",
		estimatedValue: 3900,
		source: "Web",
		stage: "qualified",
		assignedTo: "Dr. Íñigo Salas",
		lastActivityAt: minutesAgo(18),
		createdAt: daysAgo(3),
		tags: ["Cirugía"],
		notes: "Cualificada por el agente de voz. Motivación estética + fatiga palpebral. Disponible jueves 18:30.",
		aiScore: 86,
		nextAction: "Confirmar preoperatorio"
	},
	{
		id: "pablo-herrero",
		firstName: "Pablo",
		lastName: "Herrero",
		fullName: "Pablo Herrero",
		phone: "+34 647 220 119",
		email: "pablo.herrero@empresa.es",
		city: "Majadahonda",
		clinic: CLINIC_NAME,
		treatmentInterest: "Rinoplastia",
		estimatedValue: 7500,
		source: "Instagram",
		stage: "qualified",
		assignedTo: "Dr. Íñigo Salas",
		lastActivityAt: hoursAgo(9),
		createdAt: daysAgo(4),
		tags: ["Ticket alto"],
		notes: "Quiere rinoplastia ultrasónica. Viaja desde Bilbao. Preguntó por packing.",
		aiScore: 79,
		nextAction: "Enviar dossier y fechas de quirófano"
	},
	{
		id: "carmen-diaz",
		firstName: "Carmen",
		lastName: "Díaz",
		fullName: "Carmen Díaz",
		phone: "+34 600 441 873",
		email: "carmen.diaz@correo.es",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Botox y rellenos",
		estimatedValue: 890,
		source: "WhatsApp",
		stage: "proposal",
		assignedTo: "Clara Méndez",
		lastActivityAt: daysAgo(3),
		createdAt: daysAgo(6),
		tags: ["Recurrente"],
		notes: "Paciente de hidrafacial. Presupuesto de bótox y rellenos enviado hace tres días. Sin respuesta.",
		aiScore: 72,
		nextAction: "Reenganche del presupuesto"
	},
	{
		id: "hugo-alonso",
		firstName: "Hugo",
		lastName: "Alonso",
		fullName: "Hugo Alonso",
		phone: "+34 618 334 090",
		email: "hugo.alonso@gmail.com",
		city: "Las Rozas",
		clinic: CLINIC_NAME,
		treatmentInterest: "Tratamiento capilar",
		estimatedValue: 2100,
		source: "Llamada",
		stage: "proposal",
		assignedTo: "Raquel Vidal",
		lastActivityAt: daysAgo(2),
		createdAt: daysAgo(8),
		tags: ["Hombre 34"],
		notes: "Norwood III. Plan de 6 meses enviado (mesoterapia + minoxidil clínico). No ha contestado.",
		aiScore: 68,
		nextAction: "Reenganche del plan"
	},
	{
		id: "isabel-serrano",
		firstName: "Isabel",
		lastName: "Serrano",
		fullName: "Isabel Serrano",
		phone: "+34 629 550 714",
		email: "isabel.serrano@mail.com",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Armonización mandibular",
		estimatedValue: 3200,
		source: "Web",
		stage: "confirmed",
		assignedTo: "Dra. Elena Marín",
		lastActivityAt: hoursAgo(4),
		createdAt: daysAgo(8),
		tags: ["Cita jueves", "Depósito"],
		notes: "Cita confirmada. Depósito de 150 € cobrado.",
		aiScore: 91,
		appointmentAt: hoursFromNow(26),
		preferredChannel: "whatsapp",
		nextAction: "Recordatorio 24 h",
		care: [{
			id: "isabel-prep",
			kind: "prep",
			title: "Preparación mandibular",
			body: "Sin antiinflamatorios desde ayer. Acudir sin maquillaje en la zona a tratar.",
			dueAt: hoursFromNow(-3)
		}]
	},
	{
		id: "diego-romero",
		firstName: "Diego",
		lastName: "Romero",
		fullName: "Diego Romero",
		phone: "+34 666 102 887",
		email: "diego.romero@studio.eu",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Láser vascular",
		estimatedValue: 1450,
		source: "Instagram",
		stage: "confirmed",
		assignedTo: "Dra. Elena Marín",
		lastActivityAt: hoursAgo(14),
		createdAt: daysAgo(6),
		tags: ["Rosácea", "Cita martes"],
		notes: "Cita de láser vascular. Evitar sol 15 días — ya informado por WhatsApp.",
		aiScore: 74,
		appointmentAt: hoursFromNow(70),
		nextAction: "Checklist pre-láser"
	},
	{
		id: "nuria-pellicer",
		firstName: "Nuria",
		lastName: "Pellicer",
		fullName: "Nuria Pellicer",
		phone: "+34 610 978 221",
		email: "nuria.pellicer@corp.es",
		city: "Barcelona",
		clinic: CLINIC_NAME,
		treatmentInterest: "Rejuvenecimiento",
		estimatedValue: 5600,
		source: "Referral",
		stage: "confirmed",
		assignedTo: "Dr. Íñigo Salas",
		lastActivityAt: hoursAgo(20),
		createdAt: daysAgo(10),
		tags: ["Viaja", "Pack 3 sesiones"],
		notes: "Pack lifting no quirúrgico. Viaja desde Barcelona. Hotel cerca de la clínica.",
		aiScore: 88,
		appointmentAt: hoursFromNow(120),
		preferredChannel: "email",
		nextAction: "Enviar cómo llegar + ayuno",
		care: [{
			id: "nuria-prep",
			kind: "prep",
			title: "Ayuno y llegada",
			body: "Ayuno de 6 horas si hay sedación. Llegar 20 minutos antes; el hotel está a una manzana.",
			dueAt: hoursFromNow(96)
		}]
	},
	{
		id: "ana-beltran",
		firstName: "Ana",
		lastName: "Beltrán",
		fullName: "Ana Beltrán",
		phone: "+34 625 441 009",
		email: "ana.beltran@correo.es",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Rinoplastia",
		estimatedValue: 8200,
		source: "Web",
		stage: "followup",
		assignedTo: "Dr. Íñigo Salas",
		lastActivityAt: daysAgo(1),
		createdAt: daysAgo(21),
		tags: ["Cobrada", "Financiada"],
		notes: "Intervenida. Factura emitida. Revisión de puntos pendiente.",
		aiScore: 95,
		billed: true,
		preferredChannel: "whatsapp",
		nextAction: "Seguimiento postoperatorio",
		care: [{
			id: "ana-care",
			kind: "aftercare",
			title: "Primeras 24 h",
			body: "Cabeza elevada, frío local 10 minutos y no frotar. Reposo relativo hoy.",
			dueAt: hoursFromNow(-6)
		}, {
			id: "ana-review",
			kind: "review",
			title: "Revisión de puntos",
			body: "Control de simetría y retirada de puntos. Traer la medicación pautada.",
			dueAt: hoursFromNow(216)
		}]
	},
	{
		id: "tomas-gil",
		firstName: "Tomás",
		lastName: "Gil",
		fullName: "Tomás Gil",
		phone: "+34 679 330 145",
		email: "tomas.gil@holding.es",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Implantes",
		estimatedValue: 9400,
		source: "Referral",
		stage: "followup",
		assignedTo: "Raquel Vidal",
		lastActivityAt: daysAgo(2),
		createdAt: daysAgo(28),
		tags: ["VIP", "Cobrado"],
		notes: "Carga inmediata. Facturado al 100 %. Falta la fase de prótesis definitiva.",
		aiScore: 93,
		billed: true,
		nextAction: "Agendar fase 2",
		care: [{
			id: "tomas-review",
			kind: "review",
			title: "Fase de prótesis",
			body: "Confirmar que no hay movilidad y cerrar fecha de prótesis definitiva.",
			dueAt: hoursFromNow(14)
		}]
	},
	{
		id: "marta-soler",
		firstName: "Marta",
		lastName: "Soler",
		fullName: "Marta Soler",
		phone: "+34 611 204 778",
		email: "marta.soler@gmail.com",
		city: "Madrid",
		clinic: CLINIC_NAME,
		treatmentInterest: "Hidrafacial pack",
		estimatedValue: 540,
		source: "Instagram",
		stage: "invoiced",
		assignedTo: "Clara Méndez",
		lastActivityAt: daysAgo(3),
		createdAt: daysAgo(12),
		tags: ["Pack", "Upsell"],
		notes: "Pack de 4 sesiones cobrado. La ficha indica valorar médico-estético al cerrar el pack.",
		aiScore: 61,
		preferredChannel: "whatsapp",
		nextAction: "Nurturing al cerrar el pack",
		care: [{
			id: "marta-nurture",
			kind: "nurture",
			title: "Paso a médico-estético",
			body: "Ofrecer una valoración con la Dra. Marín, sin empujar otro pack.",
			dueAt: hoursFromNow(-8)
		}]
	}
];
function wa(id, patientId, direction, at, body, agent) {
	return {
		id,
		patientId,
		channel: "whatsapp",
		direction,
		at,
		title: direction === "inbound" ? "WhatsApp recibido" : "WhatsApp enviado",
		body,
		agent
	};
}
var seedTimelines = {
	"elena-ruiz": [
		wa("er-1", "elena-ruiz", "inbound", daysAgo(3), "Hola, vi vuestros resultados de blefaroplastia en la web y quería información. Tengo 47 años y se me marca mucho el párpado. ¿Hacéis primera visita?"),
		wa("er-2", "elena-ruiz", "outbound", daysAgo(3), "Hola Elena, soy Clara de AsexiA Castellana. Sí, la primera valoración con el Dr. Salas es de 60 minutos e incluye simulación. ¿Prefiere tarde o mediodía?", "Clara Méndez"),
		wa("er-3", "elena-ruiz", "inbound", daysAgo(3), "Me va mejor por la tarde, después de las 18. ¿El precio es orientativo o ya incluye quirófano?"),
		{
			id: "er-4",
			patientId: "elena-ruiz",
			channel: "voice",
			direction: "outbound",
			at: daysAgo(2),
			title: "Llamada del agente de voz",
			body: "Cualificación completa. Score 86. Motivación estética y funcional. Disponible jueves 18:30.",
			durationSec: 252,
			agent: "Agente de voz AsexiA",
			transcript: [
				{
					speaker: "agent",
					text: "Buenas tardes, ¿hablo con Elena Ruiz? Le llamo de AsexiA Castellana, siguiendo su consulta de blefaroplastia."
				},
				{
					speaker: "patient",
					text: "Sí, dígame. Estaba esperando que me llamaran."
				},
				{
					speaker: "agent",
					text: "Perfecto. Para preparar la visita con el Dr. Salas: ¿el motivo principal es estético, sensación de cansancio, o ambos?"
				},
				{
					speaker: "patient",
					text: "Los dos. Me veo cansada en fotos y por la tarde se me cansa la vista. Trabajo muchas horas delante del ordenador."
				},
				{
					speaker: "agent",
					text: "Entendido. ¿Ha valorado operarse en los próximos 60 días, o está aún en fase de información?"
				},
				{
					speaker: "patient",
					text: "Si la valoración me encaja, me operaría en octubre. Tengo vacaciones la segunda quincena."
				},
				{
					speaker: "agent",
					text: "Anoto octubre. El rango habitual para blefaroplastia superior en Castellana es de 3.400 a 4.200 €, todo incluido. Le reservo jueves 18:30 con el Dr. Salas. ¿Le viene bien?"
				},
				{
					speaker: "patient",
					text: "Jueves 18:30 perfecto. ¿Tengo que llevar algo?"
				},
				{
					speaker: "agent",
					text: "Solo una foto de frente sin maquillaje si puede, y la lista de medicación. Le confirmo por WhatsApp. Gracias, Elena."
				}
			]
		},
		wa("er-5", "elena-ruiz", "outbound", daysAgo(2), "Elena, cita reservada: jueves 18:30 con el Dr. Íñigo Salas (valoración de blefaroplastia, 60 min). Dirección: Paseo de la Castellana 95. Si necesita cambiarla, responda a este mensaje.", "Copiloto IA"),
		wa("er-6", "elena-ruiz", "inbound", hoursAgo(20), "Confirmado, ahí estaré. ¿Puedo ir maquillada o mejor no?"),
		wa("er-7", "elena-ruiz", "outbound", minutesAgo(18), "Mejor sin maquillaje en párpado, así el doctor valora el pliegue real. El resto, como prefiera. La vemos el jueves.", "Clara Méndez"),
		{
			id: "er-8",
			patientId: "elena-ruiz",
			channel: "system",
			direction: "internal",
			at: minutesAgo(16),
			title: "IA · siguiente acción",
			body: "Lead cualificado. Enviar consentimiento informado y recordatorio 24 h antes. Probabilidad de cierre: alta.",
			agent: "Copiloto IA"
		}
	],
	"lucia-mendoza": [
		wa("lm-1", "lucia-mendoza", "inbound", hoursAgo(5), "Holaaa vi el reel de pómulos 😍 quería saber precios de harmonización. Tengo 29."),
		wa("lm-2", "lucia-mendoza", "outbound", hoursAgo(4), "Hola Lucía, soy el asistente de AsexiA. La harmonización facial se valora en consulta (desde 1.800 €). ¿Busca un cambio sutil o más estructurado?", "Copiloto IA"),
		wa("lm-3", "lucia-mendoza", "inbound", minutesAgo(38), "Sutil, no quiero que se note. ¿Tenéis hueco esta semana por la tarde?")
	],
	"javier-ortega": [
		{
			id: "jo-1",
			patientId: "javier-ortega",
			channel: "system",
			direction: "internal",
			at: hoursAgo(9),
			title: "Lead de Google Ads",
			body: "Formulario web: «implantes + financiación». UTM campaign: implantologia_q3."
		},
		wa("jo-2", "javier-ortega", "outbound", hoursAgo(8), "Buenos días Javier, le escribo de AsexiA Castellana. Hemos recibido su solicitud de implantes. ¿Le va bien una llamada de 8 minutos para ver si es candidato a carga inmediata?", "Raquel Vidal"),
		wa("jo-3", "javier-ortega", "inbound", hoursAgo(2), "Sí, mejor a partir de las 19:00. ¿Financiáis a 12 meses sin entrada?")
	],
	"sofia-navarro": [
		wa("sn-1", "sofia-navarro", "inbound", hoursAgo(4), "Hola, me caso el 18 de octubre y quiero tratar una cicatriz en la mejilla. ¿Láser CO2 llega a tiempo?"),
		{
			id: "sn-2",
			patientId: "sofia-navarro",
			channel: "voice",
			direction: "outbound",
			at: hoursAgo(2),
			title: "Llamada del agente de voz",
			body: "Cicatriz post-acné grado II. Ventana pre-boda justa: se recomienda prueba de test y una sesión, no CO2 ablativo agresivo.",
			durationSec: 186,
			agent: "Agente de voz AsexiA",
			transcript: [
				{
					speaker: "agent",
					text: "Hola Sofía, le llamo de AsexiA. Me comenta que se casa el 18 de octubre. El CO2 ablativo necesita 4–6 semanas de recuperación visible. ¿La cicatriz es reciente?"
				},
				{
					speaker: "patient",
					text: "No, es de hace años, pero se me marca con el maquillaje. No puedo ir hinchada a la boda."
				},
				{
					speaker: "agent",
					text: "Entonces le propongo un protocolo conservador: test + una sesión suave, no el full-field. Se lo confirmo por WhatsApp con huecos de esta semana."
				}
			]
		},
		wa("sn-3", "sofia-navarro", "outbound", hoursAgo(1), "Sofía, el protocolo seguro pre-boda es láser fraccionado suave, no CO2 agresivo. Huecos: mañana 13:15 o viernes 19:00. ¿Cuál reserva?", "Copiloto IA")
	],
	"martin-vega": [{
		id: "mv-1",
		patientId: "martin-vega",
		channel: "system",
		direction: "internal",
		at: daysAgo(1),
		title: "Derivación interna",
		body: "Derivado por Dra. Pellicer · Ortodoncia invisible. Prefiere llamada, no WhatsApp."
	}, {
		id: "mv-2",
		patientId: "martin-vega",
		channel: "voice",
		direction: "outbound",
		at: hoursAgo(7),
		title: "Intento de llamada",
		body: "Buzón de voz. Se reprograma cualificación para mañana 10:00.",
		durationSec: 22,
		agent: "Agente de voz AsexiA",
		transcript: [{
			speaker: "agent",
			text: "Buenos días Martín, le llama AsexiA Castellana por la derivación de Invisalign de la Dra. Pellicer. Le vuelvo a llamar mañana a las 10. Un saludo."
		}]
	}],
	"pablo-herrero": [
		wa("ph-1", "pablo-herrero", "inbound", daysAgo(4), "Buenas, quiero rinoplastia ultrasónica. Vivo en Bilbao, puedo desplazarme un fin de semana. ¿Hacéis packing o es abierta?"),
		{
			id: "ph-2",
			patientId: "pablo-herrero",
			channel: "voice",
			direction: "outbound",
			at: daysAgo(3),
			title: "Llamada del agente de voz",
			body: "Cualificado. Viaja desde BIO. Interesado en ultrasónica, recuperación de 10 días. Score 79.",
			durationSec: 314,
			agent: "Agente de voz AsexiA",
			transcript: [
				{
					speaker: "agent",
					text: "Pablo, el Dr. Salas opera rinoplastia ultrasónica, de preferencia abierta. El packing se retira a las 24–48 h. ¿Tiene tabique desviado o es solo estético?"
				},
				{
					speaker: "patient",
					text: "Estético. Me molesta el dorso. Puedo estar en Madrid el 2 y el 3 de octubre."
				},
				{
					speaker: "agent",
					text: "Anoto esas fechas para valoración + TAC. Le enviamos dossier y un rango de 6.800 a 8.200 € todo incluido."
				}
			]
		},
		wa("ph-3", "pablo-herrero", "outbound", hoursAgo(6), "Pablo, dossier enviado a su correo. Fechas tentativas de valoración: 2 oct 17:00. ¿Confirmamos billete?", "Raquel Vidal")
	],
	"carmen-diaz": [
		wa("cd-1", "carmen-diaz", "inbound", daysAgo(2), "Después del hidrafacial quiero pasar a algo más serio, toxina y un poquito de labio. ¿La Dra. Marín me puede ver?"),
		wa("cd-2", "carmen-diaz", "outbound", daysAgo(1), "Carmen, por supuesto. Presupuesto orientativo: toxina 280 € + labio 320 €. Tengo jueves 11:30 o viernes 16:00.", "Clara Méndez"),
		wa("cd-3", "carmen-diaz", "inbound", hoursAgo(3), "Jueves 11:30. ¿Hace falta pasar por recepción 10 minutos antes?")
	],
	"hugo-alonso": [
		{
			id: "ha-1",
			patientId: "hugo-alonso",
			channel: "voice",
			direction: "inbound",
			at: daysAgo(5),
			title: "Llamada entrante · centralita",
			body: "Consulta de tratamiento capilar. Derivado al agente de voz para cualificación.",
			durationSec: 94,
			agent: "Centralita",
			transcript: [{
				speaker: "patient",
				text: "Buenas, llamaba por lo del pelo. Tengo 34 y se me está abriendo la entradas."
			}, {
				speaker: "agent",
				text: "Le paso con el asistente de tricología para hacerle tres preguntas y ver hueco de valoración."
			}]
		},
		{
			id: "ha-2",
			patientId: "hugo-alonso",
			channel: "voice",
			direction: "outbound",
			at: daysAgo(4),
			title: "Cualificación capilar",
			body: "Norwood III autodeclarado. No quiere injerto aún. Plan médico 6 meses.",
			durationSec: 201,
			agent: "Agente de voz AsexiA",
			transcript: [
				{
					speaker: "agent",
					text: "Hugo, ¿ha tomado minoxidil u otro tratamiento en los últimos 12 meses?"
				},
				{
					speaker: "patient",
					text: "Minoxidil un par de meses y lo dejé. No quiero pasar por quirófano ahora."
				},
				{
					speaker: "agent",
					text: "Entonces le encaja un plan de mesoterapia + control, 2.100 € en seis meses. Le mando el protocolo por escrito."
				}
			]
		},
		wa("ha-3", "hugo-alonso", "outbound", hoursAgo(11), "Hugo, le dejo el plan de 6 meses (8 sesiones). Si le encaja, reservamos la primera con tricología el martes 19:15.", "Raquel Vidal")
	],
	"isabel-serrano": [
		wa("is-1", "isabel-serrano", "inbound", daysAgo(8), "Quiero marcar un poco la mandíbula, sin pasar de natural. ¿Usáis ácido o algo permanente?"),
		{
			id: "is-2",
			patientId: "isabel-serrano",
			channel: "voice",
			direction: "outbound",
			at: daysAgo(6),
			title: "Llamada de confirmación",
			body: "Cita jueves 18:00. Depósito 150 € cobrado. Paciente informada de edema 48 h.",
			durationSec: 168,
			agent: "Agente de voz AsexiA",
			transcript: [{
				speaker: "agent",
				text: "Isabel, le confirmo armonización mandibular con la Dra. Marín, jueves 18:00. Trabajamos con ácido hialurónico, no permanentes. ¿Le va bien el depósito de 150 € ahora por enlace?"
			}, {
				speaker: "patient",
				text: "Sí, mándeme el enlace. No quiero look de Instagram, solo un poco de definición."
			}]
		},
		{
			id: "is-3",
			patientId: "isabel-serrano",
			channel: "system",
			direction: "internal",
			at: daysAgo(6),
			title: "Cita confirmada",
			body: "Jueves 18:00 · Dra. Elena Marín · Sala 2. Depósito registrado."
		},
		wa("is-4", "isabel-serrano", "outbound", hoursAgo(4), "Isabel, recordatorio: mañana 18:00. Evite antiinflamatorios 24 h antes. Nos vemos en Castellana 95.", "Copiloto IA")
	],
	"diego-romero": [
		wa("dr-1", "diego-romero", "inbound", daysAgo(6), "Tengo rosácea y vasitos en las alas. ¿El láser se puede hacer con barba?"),
		wa("dr-2", "diego-romero", "outbound", daysAgo(5), "Diego, sí, afeitamos la zona el mismo día. Cita martes 10:30. Evite sol y autobronceador 15 días.", "Clara Méndez"),
		{
			id: "dr-3",
			patientId: "diego-romero",
			channel: "system",
			direction: "internal",
			at: daysAgo(5),
			title: "Cita confirmada",
			body: "Martes 10:30 · Láser vascular · Dra. Marín."
		}
	],
	"nuria-pellicer": [
		{
			id: "np-1",
			patientId: "nuria-pellicer",
			channel: "system",
			direction: "internal",
			at: daysAgo(10),
			title: "Referral Barcelona",
			body: "Derivada por grupo partner. Pack lifting no quirúrgico 3 sesiones."
		},
		{
			id: "np-2",
			patientId: "nuria-pellicer",
			channel: "voice",
			direction: "outbound",
			at: daysAgo(7),
			title: "Coordinación de viaje",
			body: "Confirmada sesión 1 el día 24. Paciente llega en AVE 09:40.",
			durationSec: 240,
			agent: "Raquel Vidal",
			transcript: [
				{
					speaker: "agent",
					text: "Nuria, reservamos el 24 a las 12:00 para que llegue con calma desde Atocha. El pack es de 5.600 €, tres sesiones. ¿Facturamos a empresa o particular?"
				},
				{
					speaker: "patient",
					text: "Particular. ¿Me podéis recomendar un hotel andando a la clínica?"
				},
				{
					speaker: "agent",
					text: "Sí, le envío tres opciones a menos de 8 minutos. Ayuno de 2 horas no hace falta para este protocolo."
				}
			]
		},
		wa("np-3", "nuria-pellicer", "outbound", hoursAgo(20), "Nuria, cómo llegar: Castellana 95, entrada por Zurbarán. Hoteles: NH Collection y Palacio de los Duques. Sesión 1 · 24 · 12:00.", "Raquel Vidal")
	],
	"ana-beltran": [
		{
			id: "ab-1",
			patientId: "ana-beltran",
			channel: "system",
			direction: "internal",
			at: daysAgo(4),
			title: "Factura emitida",
			body: "Rinoplastia ultrasónica · 8.200 € · pagada. Revisión en 10 días."
		},
		wa("ab-2", "ana-beltran", "outbound", daysAgo(1), "Ana, revisión el día 22 a las 09:30. Recuerde no usar gafas de sol pesadas esta semana. Cualquier duda, este hilo.", "Dr. Íñigo Salas"),
		wa("ab-3", "ana-beltran", "inbound", daysAgo(1), "Perfecto, la hinchazón ha bajado mucho. Gracias.")
	],
	"tomas-gil": [{
		id: "tg-1",
		patientId: "tomas-gil",
		channel: "system",
		direction: "internal",
		at: daysAgo(2),
		title: "Factura emitida",
		body: "Implantes carga inmediata · 9.400 € · 100 % cobrado. Fase 2 prótesis en 4 meses."
	}, {
		id: "tg-2",
		patientId: "tomas-gil",
		channel: "voice",
		direction: "outbound",
		at: daysAgo(2),
		title: "Llamada de cortesía VIP",
		body: "Postoperatorio correcto. Se agenda fase 2 de forma orientativa.",
		durationSec: 132,
		agent: "Raquel Vidal",
		transcript: [{
			speaker: "agent",
			text: "Tomás, le llamo para saber cómo ha dormido con la provisional. ¿Algún punto que le roce?"
		}, {
			speaker: "patient",
			text: "Todo bien. Cuando queráis vemos la definitiva."
		}]
	}],
	"marta-soler": [
		wa("ms-1", "marta-soler", "inbound", daysAgo(12), "El pack de hidrafacial de 4 sesiones, ¿sigue el precio del reel?"),
		{
			id: "ms-2",
			patientId: "marta-soler",
			channel: "system",
			direction: "internal",
			at: daysAgo(10),
			title: "Factura emitida",
			body: "Pack Hidrafacial ×4 · 540 €. Upsell médico-estético programado a 21 días."
		},
		wa("ms-3", "marta-soler", "outbound", daysAgo(3), "Marta, ya tiene 2 de 4 sesiones. Cuando quiera le preparamos un plan de mantenimiento con la Dra. Marín.", "Clara Méndez")
	]
};
function seedCatalog() {
	return {
		activities: [
			{
				id: "armonizacion",
				sector: "Medicina estética",
				subsector: "Facial",
				name: "Harmonización facial",
				description: "Valoración y tratamiento de pómulos y perfil.",
				durationMin: 60,
				price: 2400
			},
			{
				id: "implantes",
				sector: "Odontología",
				subsector: "Cirugía",
				name: "Implantes dentales",
				description: "Fase quirúrgica. Incluye control a la semana.",
				durationMin: 90,
				price: 6800
			},
			{
				id: "laser-co2",
				sector: "Medicina estética",
				subsector: "Láser",
				name: "Láser CO2",
				description: "Resurfacing de cicatriz. Sala con extracción.",
				durationMin: 45,
				price: 1250
			},
			{
				id: "blefaro",
				sector: "Cirugía",
				subsector: "Párpados",
				name: "Blefaroplastia",
				description: "Valoración y cirugía de párpados.",
				durationMin: 90,
				price: 3900
			},
			{
				id: "rino",
				sector: "Cirugía",
				subsector: "Nariz",
				name: "Rinoplastia",
				description: "Intervención en quirófano y revisión de puntos.",
				durationMin: 150,
				price: 8200
			},
			{
				id: "botox",
				sector: "Medicina estética",
				subsector: "Infiltración",
				name: "Botox y rellenos",
				description: "Sesión médico-estética.",
				durationMin: 40,
				price: 890
			},
			{
				id: "capilar",
				sector: "Medicina estética",
				subsector: "Capilar",
				name: "Tratamiento capilar",
				description: "Mesoterapia. Plan de 6 meses.",
				durationMin: 45,
				price: 2100
			},
			{
				id: "invisalign",
				sector: "Odontología",
				subsector: "Ortodoncia",
				name: "Invisalign",
				description: "Estudio y inicio de alineadores.",
				durationMin: 60,
				price: 4200
			},
			{
				id: "laser-vascular",
				sector: "Medicina estética",
				subsector: "Láser",
				name: "Láser vascular",
				description: "Sesión de rojeces. Evitar sol 15 días.",
				durationMin: 40,
				price: 1450
			},
			{
				id: "rejuvenecimiento",
				sector: "Medicina estética",
				subsector: "Facial",
				name: "Rejuvenecimiento",
				description: "Pack no quirúrgico. Tres sesiones.",
				durationMin: 75,
				price: 5600
			},
			{
				id: "hidrafacial",
				sector: "Medicina estética",
				subsector: "Facial",
				name: "Hidrafacial",
				description: "Sesión de pack. Sin incapacidad.",
				durationMin: 50,
				price: 135
			},
			{
				id: "revision",
				sector: "Clínica",
				subsector: "Seguimiento",
				name: "Revisión",
				description: "Control incluido en el tratamiento.",
				durationMin: 20,
				price: 0
			},
			{
				id: "protesis",
				sector: "Odontología",
				subsector: "Prótesis",
				name: "Prótesis definitiva",
				description: "Fase protésica tras carga inmediata.",
				durationMin: 60,
				price: 3400
			}
		],
		rooms: [
			{
				id: "sala-1",
				name: "Sala 1 · Facial"
			},
			{
				id: "sala-2",
				name: "Sala 2 · Láser"
			},
			{
				id: "quirofano",
				name: "Quirófano"
			},
			{
				id: "box",
				name: "Box dental"
			}
		],
		hours: [
			{
				day: 1,
				label: "Lunes",
				open: "10:00",
				close: "20:00",
				closed: false
			},
			{
				day: 2,
				label: "Martes",
				open: "10:00",
				close: "20:00",
				closed: false
			},
			{
				day: 3,
				label: "Miércoles",
				open: "10:00",
				close: "20:00",
				closed: false
			},
			{
				day: 4,
				label: "Jueves",
				open: "10:00",
				close: "20:00",
				closed: false
			},
			{
				day: 5,
				label: "Viernes",
				open: "10:00",
				close: "20:00",
				closed: false
			},
			{
				day: 6,
				label: "Sábado",
				open: "10:00",
				close: "14:00",
				closed: false
			},
			{
				day: 0,
				label: "Domingo",
				open: "10:00",
				close: "14:00",
				closed: true
			}
		]
	};
}
function birthdayIn(days, yearsAgo) {
	const date = /* @__PURE__ */ new Date();
	date.setFullYear(date.getFullYear() - yearsAgo);
	date.setDate(date.getDate() + days);
	const pad = (value) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function visit(partial) {
	return partial;
}
function pay(partial) {
	return partial;
}
function attachClinic(list) {
	const todayAt = (hour, minute = 0) => {
		const date = /* @__PURE__ */ new Date();
		date.setHours(hour, minute, 0, 0);
		return date.toISOString();
	};
	const openSlot = (hour, minute, minDaysAhead) => {
		const date = /* @__PURE__ */ new Date();
		date.setDate(date.getDate() + minDaysAhead);
		date.setHours(hour, minute, 0, 0);
		if (date.getTime() < Date.now()) date.setDate(date.getDate() + 1);
		while (date.getDay() === 0) date.setDate(date.getDate() + 1);
		return date.toISOString();
	};
	const isabelAt = openSlot(11, 0, 1);
	const tomasAt = openSlot(16, 30, 1);
	const diegoAt = todayAt(11, 30);
	const nuriaAt = openSlot(12, 0, 3);
	const anaReview = openSlot(9, 30, 9);
	const martaNext = openSlot(17, 0, 12);
	const elenaPay = openSlot(12, 30, 1);
	const extras = {
		"isabel-serrano": {
			birthday: birthdayIn(3, 36),
			ledgerTotal: 3200,
			appointmentAt: isabelAt,
			contraindications: "Ninguna conocida.",
			consentSigned: false,
			pendings: [{
				id: "isabel-p1",
				title: "Confirmar que no toma antiinflamatorios",
				done: false,
				createdAt: daysAgo(1)
			}],
			visits: [visit({
				id: "isabel-v0",
				at: daysAgo(6),
				activityId: "armonizacion",
				activityName: "Harmonización facial",
				roomId: "sala-1",
				roomName: "Sala 1 · Facial",
				durationMin: 30,
				professional: "Dra. Elena Marín",
				status: "realizada",
				notes: "Valoración. Depósito cobrado.",
				price: 0
			}), visit({
				id: "isabel-v1",
				at: isabelAt,
				activityId: "armonizacion",
				activityName: "Harmonización facial",
				roomId: "sala-1",
				roomName: "Sala 1 · Facial",
				durationMin: 60,
				professional: "Dra. Elena Marín",
				status: "programada",
				notes: "Sesión de tratamiento. Sin maquillaje en la zona.",
				price: 3050
			})],
			payments: [pay({
				id: "isabel-pay0",
				dueAt: todayAt(10, 15),
				paidAt: todayAt(10, 15),
				amount: 150,
				concept: "Depósito de reserva",
				status: "cobrado"
			}), pay({
				id: "isabel-pay1",
				dueAt: isabelAt,
				amount: 3050,
				concept: "Resto de harmonización",
				status: "pendiente"
			})]
		},
		"ana-beltran": {
			birthday: birthdayIn(40, 41),
			ledgerTotal: 8200,
			billed: true,
			consentSigned: true,
			contraindications: "Ninguna conocida. Consentimiento de quirófano firmado.",
			pendings: [{
				id: "ana-p1",
				title: "Fotos de control antes de la revisión",
				done: false,
				createdAt: daysAgo(1)
			}],
			visits: [visit({
				id: "ana-v0",
				at: daysAgo(12),
				activityId: "rino",
				activityName: "Rinoplastia",
				roomId: "quirofano",
				roomName: "Quirófano",
				durationMin: 150,
				professional: "Dr. Íñigo Salas",
				status: "realizada",
				notes: "Intervención sin incidencias. Factura emitida.",
				price: 8200
			}), visit({
				id: "ana-v1",
				at: anaReview,
				activityId: "revision",
				activityName: "Revisión",
				roomId: "sala-1",
				roomName: "Sala 1 · Facial",
				durationMin: 20,
				professional: "Dr. Íñigo Salas",
				status: "programada",
				notes: "Retirada de puntos y simetría.",
				price: 0
			})],
			payments: [pay({
				id: "ana-pay0",
				dueAt: daysAgo(12),
				amount: 8200,
				concept: "Rinoplastia",
				status: "cobrado"
			})]
		},
		"tomas-gil": {
			birthday: birthdayIn(80, 52),
			ledgerTotal: 9400,
			billed: true,
			appointmentAt: tomasAt,
			pendings: [{
				id: "tomas-p1",
				title: "Confirmar ausencia de movilidad",
				done: false,
				createdAt: daysAgo(2)
			}],
			visits: [visit({
				id: "tomas-v0",
				at: daysAgo(20),
				activityId: "implantes",
				activityName: "Implantes dentales",
				roomId: "box",
				roomName: "Box dental",
				durationMin: 90,
				professional: "Raquel Vidal",
				status: "realizada",
				notes: "Carga inmediata. Fase quirúrgica cobrada.",
				price: 6e3
			}), visit({
				id: "tomas-v1",
				at: tomasAt,
				activityId: "protesis",
				activityName: "Prótesis definitiva",
				roomId: "box",
				roomName: "Box dental",
				durationMin: 60,
				professional: "Raquel Vidal",
				status: "programada",
				notes: "Toma de fase protésica.",
				price: 3400
			})],
			payments: [pay({
				id: "tomas-pay0",
				dueAt: daysAgo(20),
				amount: 6e3,
				concept: "Fase quirúrgica",
				status: "cobrado"
			}), pay({
				id: "tomas-pay1",
				dueAt: tomasAt,
				amount: 3400,
				concept: "Prótesis definitiva",
				status: "pendiente"
			})]
		},
		"marta-soler": {
			birthday: birthdayIn(15, 29),
			ledgerTotal: 540,
			billed: true,
			visits: [
				visit({
					id: "marta-v0",
					at: daysAgo(20),
					activityId: "hidrafacial",
					activityName: "Hidrafacial",
					roomId: "sala-1",
					roomName: "Sala 1 · Facial",
					durationMin: 50,
					professional: "Clara Méndez",
					status: "realizada",
					notes: "Sesión 1 de 4.",
					price: 135
				}),
				visit({
					id: "marta-v1",
					at: daysAgo(3),
					activityId: "hidrafacial",
					activityName: "Hidrafacial",
					roomId: "sala-1",
					roomName: "Sala 1 · Facial",
					durationMin: 50,
					professional: "Clara Méndez",
					status: "realizada",
					notes: "Sesión 2 de 4.",
					price: 135
				}),
				visit({
					id: "marta-v2",
					at: martaNext,
					activityId: "hidrafacial",
					activityName: "Hidrafacial",
					roomId: "sala-1",
					roomName: "Sala 1 · Facial",
					durationMin: 50,
					professional: "Clara Méndez",
					status: "programada",
					notes: "Sesión 3 de 4.",
					price: 135
				})
			],
			payments: [pay({
				id: "marta-pay0",
				dueAt: daysAgo(20),
				amount: 540,
				concept: "Pack 4 sesiones",
				status: "cobrado"
			})]
		},
		"diego-romero": {
			ledgerTotal: 1450,
			appointmentAt: diegoAt,
			visits: [visit({
				id: "diego-v1",
				at: diegoAt,
				activityId: "laser-vascular",
				activityName: "Láser vascular",
				roomId: "sala-2",
				roomName: "Sala 2 · Láser",
				durationMin: 40,
				professional: "Dra. Elena Marín",
				status: "programada",
				notes: "Evitar sol. Ya informado.",
				price: 1450
			})],
			payments: [pay({
				id: "diego-pay1",
				dueAt: diegoAt,
				amount: 1450,
				concept: "Láser vascular",
				status: "pendiente"
			})]
		},
		"nuria-pellicer": {
			ledgerTotal: 5600,
			appointmentAt: nuriaAt,
			visits: [visit({
				id: "nuria-v1",
				at: nuriaAt,
				activityId: "rejuvenecimiento",
				activityName: "Rejuvenecimiento",
				roomId: "sala-1",
				roomName: "Sala 1 · Facial",
				durationMin: 75,
				professional: "Dr. Íñigo Salas",
				status: "programada",
				notes: "Primera sesión del pack. Viaja desde Barcelona.",
				price: 1860
			})],
			payments: [pay({
				id: "nuria-pay1",
				dueAt: nuriaAt,
				amount: 1860,
				concept: "Sesión 1 de 3",
				status: "pendiente"
			})]
		},
		"elena-ruiz": {
			birthday: birthdayIn(120, 44),
			ledgerTotal: 3900,
			consentSigned: false,
			contraindications: "Fatiga palpebral. No toma anticoagulantes. Falta el consentimiento de quirófano.",
			payments: [pay({
				id: "elena-pay1",
				dueAt: elenaPay,
				amount: 500,
				concept: "Reserva de valoración quirúrgica",
				status: "pendiente"
			})],
			pendings: [{
				id: "elena-p1",
				title: "Cerrar hueco de preoperatorio",
				done: false,
				createdAt: daysAgo(1)
			}]
		},
		"martin-vega": { pendings: [{
			id: "martin-p1",
			title: "Llamar antes de las 19 h. No escribir.",
			done: false,
			createdAt: hoursFromNow(-7)
		}] }
	};
	return list.map((patient) => {
		const extra = extras[patient.id];
		if (!extra) return {
			...patient,
			ledgerTotal: patient.ledgerTotal ?? patient.estimatedValue,
			visits: patient.visits ?? [],
			payments: patient.payments ?? [],
			pendings: patient.pendings ?? []
		};
		return {
			...patient,
			...extra
		};
	});
}
var KEY = "asexia.snapshot.v5";
function isOffline() {
	return typeof navigator !== "undefined" && navigator.onLine === false;
}
function readSnapshot() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed.patients)) return null;
		return {
			patients: parsed.patients,
			outbox: parsed.outbox ?? [],
			resolvedAlarms: parsed.resolvedAlarms ?? {},
			timelines: parsed.timelines,
			catalog: parsed.catalog
		};
	} catch {
		return null;
	}
}
function writeSnapshot(snapshot) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(snapshot));
	} catch {}
}
var restored = typeof window !== "undefined" ? readSnapshot() : null;
var patients = restored?.patients?.length ? restored.patients : attachClinic(seedPatients.map((patient) => ({ ...patient })));
var outbox = restored?.outbox ?? [];
var resolvedAlarms = restored?.resolvedAlarms ?? {};
var catalog = restored?.catalog ?? seedCatalog();
var timelines = restored?.timelines ? restored.timelines : Object.fromEntries(Object.entries(seedTimelines).map(([id, events]) => [id, events.map((event) => ({ ...event }))]));
function persist() {
	writeSnapshot({
		patients,
		outbox,
		resolvedAlarms,
		timelines,
		catalog
	});
}
function queueMove(id, stage) {
	outbox = [...outbox.filter((item) => item.patientId !== id), {
		id: `mv-${id}-${Date.now()}`,
		kind: "move",
		patientId: id,
		stage,
		at: (/* @__PURE__ */ new Date()).toISOString()
	}];
}
function clone(value) {
	return structuredClone(value);
}
function computeMetrics(list) {
	const closed = list.filter((patient) => patient.stage === "invoiced" || patient.billed);
	const pipelineValue = list.filter((patient) => patient.stage !== "invoiced" && patient.stage !== "lost" && !patient.billed).reduce((sum, patient) => sum + patient.estimatedValue, 0);
	const closedValue = closed.reduce((sum, patient) => sum + patient.estimatedValue, 0);
	const conversionRate = list.length === 0 ? 0 : Math.round(closed.length / list.length * 100);
	return {
		leadCount: list.length,
		pipelineValue,
		conversionRate,
		appointmentsThisWeek: list.filter((patient) => patient.stage === "confirmed").length,
		averageTicket: closed.length === 0 ? 0 : Math.round(closedValue / closed.length)
	};
}
function withResolution(alarms) {
	return alarms.map((alarm) => {
		const status = resolvedAlarms[alarm.id];
		return status ? {
			...alarm,
			status
		} : alarm;
	});
}
var QUEUE_WINDOW = 864e5;
var BIRTHDAY_WINDOW = 6048e5;
function pushEvent(patientId, event) {
	timelines[patientId] = [{
		id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
		patientId,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...event
	}, ...timelines[patientId] ?? []];
}
function patchPatient(id, recipe) {
	const current = patients.find((patient) => patient.id === id);
	if (!current) return null;
	const next = recipe({
		...current,
		lastActivityAt: (/* @__PURE__ */ new Date()).toISOString()
	});
	patients = patients.map((patient) => patient.id === id ? next : patient);
	persist();
	return next;
}
function createMockClient() {
	return {
		async listPipeline() {
			if (isOffline()) return clone(patients);
			await wait(720);
			persist();
			return clone(patients);
		},
		async getPatient(id) {
			if (!isOffline()) await wait(640);
			return clone(patients.find((patient) => patient.id === id) ?? null);
		},
		async listTimeline(patientId) {
			if (!isOffline()) await wait(680);
			return clone(timelines[patientId] ?? []);
		},
		async movePatient(id, stage) {
			if (!isOffline()) await wait(220);
			patients = patients.map((patient) => patient.id === id ? {
				...patient,
				stage,
				lastActivityAt: (/* @__PURE__ */ new Date()).toISOString()
			} : patient);
			const updated = patients.find((patient) => patient.id === id);
			if (!updated) throw new Error(`Paciente no encontrado: ${id}`);
			if (isOffline()) queueMove(id, stage);
			else outbox = outbox.filter((item) => item.patientId !== id);
			persist();
			return clone(updated);
		},
		async getMetrics() {
			if (!isOffline()) await wait(560);
			return computeMetrics(patients);
		},
		async askCopilot(prompt, currentPatients) {
			if (!isOffline()) await wait(520);
			return copilotReply(prompt, currentPatients);
		},
		async listAlarms() {
			if (!isOffline()) await wait(480);
			const now = Date.now();
			return clone(withResolution(buildAlarms(patients, now)).filter((alarm) => alarm.status !== "sent" && alarm.status !== "dismissed" && new Date(alarm.dueAt).getTime() <= now + (alarm.kind === "birthday" ? BIRTHDAY_WINDOW : QUEUE_WINDOW)).sort((a, b) => Number(a.status !== "due") - Number(b.status !== "due")));
		},
		async listPatientAlarms(patientId) {
			if (!isOffline()) await wait(420);
			return clone(withResolution(buildAlarms(patients.filter((patient) => patient.id === patientId))).filter((alarm) => alarm.status !== "dismissed"));
		},
		async resolveAlarm(id, status) {
			if (!isOffline()) await wait(180);
			const alarm = withResolution(buildAlarms(patients)).find((item) => item.id === id);
			if (!alarm) return null;
			resolvedAlarms = {
				...resolvedAlarms,
				[id]: status
			};
			if (status === "sent") {
				const title = alarm.channel === "internal" ? "Llamada registrada" : alarm.channel === "email" ? "Correo preparado" : "WhatsApp preparado";
				const event = {
					id: `alarm-${id}-${Date.now()}`,
					patientId: alarm.patientId,
					channel: alarm.channel === "whatsapp" ? "whatsapp" : alarm.channel === "email" ? "email" : "system",
					direction: "outbound",
					at: (/* @__PURE__ */ new Date()).toISOString(),
					title,
					body: alarm.draft
				};
				timelines[alarm.patientId] = [event, ...timelines[alarm.patientId] ?? []];
			}
			persist();
			return clone({
				...alarm,
				status
			});
		},
		async getCatalog() {
			if (!isOffline()) await wait(280);
			return clone(catalog);
		},
		async saveCatalog(next) {
			if (!isOffline()) await wait(220);
			catalog = clone(next);
			persist();
			return clone(catalog);
		},
		async logContact(patientId, entry) {
			if (!isOffline()) await wait(180);
			if (!patients.find((item) => item.id === patientId)) return null;
			const title = entry.channel === "whatsapp" ? "WhatsApp enviado" : entry.channel === "email" ? "Correo enviado" : "Nota de ficha";
			pushEvent(patientId, {
				channel: entry.channel,
				direction: entry.channel === "system" ? "internal" : "outbound",
				title,
				body: entry.body.trim()
			});
			return clone(patchPatient(patientId, (current) => current));
		},
		async addVisit(patientId, input) {
			if (!isOffline()) await wait(220);
			const patient = patients.find((item) => item.id === patientId);
			if (!patient) return null;
			if ((input.roomId === "quirofano" || input.activityId === "rino" || input.activityId === "blefaro") && !patient.consentSigned) throw new Error("consent");
			const activity = catalog.activities.find((item) => item.id === input.activityId);
			const room = catalog.rooms.find((item) => item.id === input.roomId);
			const visit = {
				id: `visit-${Date.now()}`,
				at: input.at,
				activityId: input.activityId,
				activityName: activity?.name ?? "Actividad",
				roomId: input.roomId,
				roomName: room?.name ?? "Sala",
				durationMin: activity?.durationMin ?? 30,
				professional: input.professional || patient.assignedTo,
				status: "programada",
				notes: input.notes.trim(),
				price: activity?.price ?? 0
			};
			const when = new Intl.DateTimeFormat("es-ES", {
				weekday: "short",
				day: "numeric",
				month: "short",
				hour: "2-digit",
				minute: "2-digit"
			}).format(new Date(input.at));
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Cita programada",
				body: `${visit.activityName} · ${visit.roomName} · ${when} · ${visit.durationMin} min · ${visit.professional}. ${visit.notes}`.trim()
			});
			return clone(patchPatient(patientId, (current) => {
				const visits = [...current.visits ?? [], visit];
				const nextAt = visits.filter((item) => item.status === "programada").map((item) => item.at).sort()[0];
				return {
					...current,
					visits,
					appointmentAt: nextAt ?? current.appointmentAt
				};
			}));
		},
		async addPayment(patientId, input) {
			if (!isOffline()) await wait(180);
			if (!patients.find((item) => item.id === patientId)) return null;
			const payment = {
				id: `pay-${Date.now()}`,
				dueAt: input.dueAt,
				amount: input.amount,
				concept: input.concept.trim(),
				status: input.status
			};
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: input.status === "cobrado" ? "Cobro registrado" : "Pago planificado",
				body: `${payment.concept} · ${payment.amount} € · ${input.status}.`
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				payments: [...current.payments ?? [], payment],
				billed: input.status === "cobrado" && (current.payments ?? []).filter((item) => item.status === "cobrado").reduce((sum, item) => sum + item.amount, 0) + input.amount >= (current.ledgerTotal ?? current.estimatedValue)
			})));
		},
		async addPending(patientId, title) {
			if (!isOffline()) await wait(120);
			if (!patients.find((item) => item.id === patientId)) return null;
			const task = {
				id: `todo-${Date.now()}`,
				title: title.trim(),
				done: false,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Pendiente añadido",
				body: task.title
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				pendings: [...current.pendings ?? [], task]
			})));
		},
		async togglePending(patientId, pendingId) {
			if (!isOffline()) await wait(80);
			const patient = patients.find((item) => item.id === patientId);
			if (!patient) return null;
			const task = (patient.pendings ?? []).find((item) => item.id === pendingId);
			if (!task) return null;
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: task.done ? "Pendiente reabierto" : "Pendiente cerrado",
				body: task.title
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				pendings: (current.pendings ?? []).map((item) => item.id === pendingId ? {
					...item,
					done: !item.done
				} : item)
			})));
		},
		async addManualAlarm(patientId, input) {
			if (!isOffline()) await wait(160);
			if (!patients.find((item) => item.id === patientId)) return null;
			const alarm = {
				id: `ma-${Date.now()}`,
				title: input.title.trim(),
				dueAt: input.dueAt,
				channel: input.channel,
				draft: input.draft.trim()
			};
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Alarma creada",
				body: `${alarm.title}. ${alarm.draft}`
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				manualAlarms: [...current.manualAlarms ?? [], alarm]
			})));
		},
		async signConsent(patientId) {
			if (!isOffline()) await wait(120);
			if (!patients.find((item) => item.id === patientId)) return null;
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Consentimiento firmado",
				body: "El paciente firma el consentimiento informado."
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				consentSigned: true
			})));
		},
		async setContraindications(patientId, text) {
			if (!isOffline()) await wait(80);
			if (!patients.find((item) => item.id === patientId)) return null;
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Contraindicaciones",
				body: text.trim() || "Sin contraindicaciones."
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				contraindications: text.trim()
			})));
		},
		async markLost(patientId, reason) {
			if (!isOffline()) await wait(140);
			if (!patients.find((item) => item.id === patientId)) return null;
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Dado por perdido",
				body: reason.trim()
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				stage: "lost",
				lostReason: reason.trim()
			})));
		},
		async recordSatisfaction(patientId, score) {
			if (!isOffline()) await wait(100);
			if (!patients.find((item) => item.id === patientId)) return null;
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Seguimiento 48 h",
				body: score === "bien" ? "Bien" : score === "regular" ? "Regular" : "Mal"
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				satisfaction: score
			})));
		},
		async collectPayment(patientId, paymentId) {
			if (!isOffline()) await wait(140);
			const patient = patients.find((item) => item.id === patientId);
			const payment = patient?.payments?.find((item) => item.id === paymentId);
			if (!patient || !payment) return null;
			pushEvent(patientId, {
				channel: "system",
				direction: "internal",
				title: "Cobro en caja",
				body: `${payment.concept} · ${payment.amount} €`
			});
			return clone(patchPatient(patientId, (current) => ({
				...current,
				payments: (current.payments ?? []).map((item) => item.id === paymentId ? {
					...item,
					status: "cobrado",
					paidAt: (/* @__PURE__ */ new Date()).toISOString()
				} : item)
			})));
		}
	};
}
var api = createMockClient();
function pendingMoves() {
	return outbox.length;
}
function flushOutbox() {
	const count = outbox.length;
	outbox = [];
	persist();
	return count;
}
var COPILOT_SUGGESTIONS = [
	"Resumen del pipeline",
	"Leads sin respuesta",
	"Briefing de Elena Ruiz",
	"Previsión de facturación",
	"Redactar WhatsApp"
];
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DMvJ3L8T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function AsexiAMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "9",
				className: "fill-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 7.5 8.8 24h3.15l1.42-3.55h5.26L19.99 24h3.21L16 7.5Zm-.02 5.3 1.86 4.65h-3.74l1.88-4.65Z",
				className: "fill-accent-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "24.2",
				cy: "8.2",
				r: "1.35",
				className: "fill-accent-fg"
			})
		]
	});
}
var ROLE_KEY = "asexia.role";
function storedRole() {
	if (typeof window === "undefined") return "direccion";
	const value = window.localStorage.getItem(ROLE_KEY);
	if (value === "recepcion" || value === "medico" || value === "direccion") return value;
	return "direccion";
}
var useUiStore = create((set) => ({
	search: "",
	copilotOpen: false,
	copilotMessages: [openingMessage()],
	copilotBusy: false,
	role: storedRole(),
	doctor: "Dra. Elena Marín",
	setSearch: (search) => set({ search }),
	setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
	pushMessage: (message) => set((state) => ({ copilotMessages: [...state.copilotMessages, message] })),
	setCopilotBusy: (copilotBusy) => set({ copilotBusy }),
	resetCopilot: () => set({
		copilotMessages: [openingMessage()],
		copilotBusy: false
	}),
	setRole: (role) => {
		if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY, role);
		set({ role });
	},
	setDoctor: (doctor) => set({ doctor })
}));
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-quick ease-out-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-press", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg shadow-border hover:opacity-90",
			secondary: "bg-accent-soft text-accent hover:bg-accent-soft/80",
			outline: "bg-surface text-ink shadow-border hover:shadow-border-hover",
			ghost: "text-ink-muted hover:bg-accent-soft hover:text-ink",
			fab: "bg-accent text-accent-fg shadow-overlay"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-lg px-5 text-sm",
			icon: "size-11 rounded-md",
			pill: "h-12 rounded-full px-5 text-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function CopilotFab() {
	const open = useUiStore((state) => state.copilotOpen);
	const setOpen = useUiStore((state) => state.setCopilotOpen);
	if (open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "fab",
		size: "pill",
		className: "fab-anchor fixed z-30 gap-2.5",
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Copiloto IA"]
	});
}
function CopilotDrawer() {
	const open = useUiStore((state) => state.copilotOpen);
	const setOpen = useUiStore((state) => state.setCopilotOpen);
	const messages = useUiStore((state) => state.copilotMessages);
	const busy = useUiStore((state) => state.copilotBusy);
	const pushMessage = useUiStore((state) => state.pushMessage);
	const setBusy = useUiStore((state) => state.setCopilotBusy);
	const [draft, setDraft] = (0, import_react.useState)("");
	const scroller = (0, import_react.useRef)(null);
	const pipelineQuery = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => api.listPipeline(),
		enabled: open
	});
	(0, import_react.useEffect)(() => {
		const node = scroller.current;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
	}, [
		messages,
		busy,
		open
	]);
	async function send(text) {
		const prompt = text.trim();
		if (!prompt || busy) return;
		const userMessage = {
			id: `user-${Date.now()}`,
			role: "user",
			content: prompt,
			at: (/* @__PURE__ */ new Date()).toISOString()
		};
		pushMessage(userMessage);
		setDraft("");
		setBusy(true);
		try {
			const reply = await api.askCopilot(prompt, pipelineQuery.data ?? []);
			pushMessage(reply);
		} finally {
			setBusy(false);
		}
	}
	function onSubmit(event) {
		event.preventDefault();
		send(draft);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-ink/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: cn("fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-overlay", "data-[state=open]:animate-in data-[state=closed]:animate-out", "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right", "duration-slow"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "font-display text-lg font-medium text-ink",
						children: "Copiloto IA"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs text-ink-muted",
						children: "Asistente de dirección · AsexiA Castellana"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Cerrar copiloto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scroller,
					className: "flex-1 space-y-3 overflow-y-auto px-5 py-4",
					children: [messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bubble, { message }, message.id)), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1.5 px-1 py-2",
						"aria-label": "El copiloto está escribiendo",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 animate-pulse rounded-full bg-ink-subtle" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 animate-pulse rounded-full bg-ink-subtle delay-75" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 animate-pulse rounded-full bg-ink-subtle delay-150" })
						]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border px-5 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex gap-2 overflow-x-auto pb-1",
						children: COPILOT_SUGGESTIONS.map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void send(suggestion),
							className: "h-8 shrink-0 rounded-full bg-bg px-3 text-xs text-ink-muted transition-colors duration-quick hover:bg-accent-soft hover:text-accent",
							children: suggestion
						}, suggestion))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit,
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft,
							onChange: (event) => setDraft(event.target.value),
							placeholder: "Pregunte al copiloto…",
							className: "h-11 flex-1 rounded-md bg-bg px-3 text-sm text-ink outline-none ring-0 placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-accent/35"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "icon",
							disabled: !draft.trim() || busy,
							"aria-label": "Enviar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
						})]
					})]
				})
			]
		})] })
	});
}
function Bubble({ message }) {
	const mine = message.role === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex", mine ? "justify-end" : "justify-start"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("max-w-[90%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed", mine ? "rounded-br-xs bg-accent text-accent-fg" : "rounded-bl-xs bg-bg text-ink"),
			children: message.content
		})
	});
}
function registerServiceWorker() {
	if (typeof window === "undefined") return;
	if (!("serviceWorker" in navigator)) return;
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js");
	});
}
function isStandalone() {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(display-mode: standalone)").matches || "standalone" in navigator && Boolean(navigator.standalone);
}
function isIos() {
	if (typeof navigator === "undefined") return false;
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function StatusChrome() {
	const [online, setOnline] = (0, import_react.useState)(true);
	const [pending, setPending] = (0, import_react.useState)(0);
	const [installEvent, setInstallEvent] = (0, import_react.useState)(null);
	const [showIosHint, setShowIosHint] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		registerServiceWorker();
		setOnline(navigator.onLine);
		setPending(pendingMoves());
		setShowIosHint(isIos() && !isStandalone());
		const onOnline = () => {
			setOnline(true);
			const flushed = flushOutbox();
			setPending(0);
			if (flushed > 0) import("../_libs/sonner.mjs").then((n) => n.n).then(({ toast }) => toast.success(`${flushed} cambio${flushed === 1 ? "" : "s"} listo${flushed === 1 ? "" : "s"} para el API`));
		};
		const onOffline = () => {
			setOnline(false);
			setPending(pendingMoves());
		};
		const onInstall = (event) => {
			event.preventDefault();
			setInstallEvent(event);
		};
		window.addEventListener("online", onOnline);
		window.addEventListener("offline", onOffline);
		window.addEventListener("beforeinstallprompt", onInstall);
		return () => {
			window.removeEventListener("online", onOnline);
			window.removeEventListener("offline", onOffline);
			window.removeEventListener("beforeinstallprompt", onInstall);
		};
	}, []);
	if (online && !installEvent && !showIosHint) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		!online ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 bg-ink px-4 py-2 text-accent-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-snug",
				children: [
					"Sin red. Se muestra la última copia",
					pending > 0 ? ` · ${pending} cambio${pending === 1 ? "" : "s"} pendiente${pending === 1 ? "" : "s"}` : "",
					"."
				]
			})]
		}) : null,
		installEvent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 border-b border-border bg-accent-soft px-4 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-accent",
				children: "Instale AsexiA en la pantalla de inicio."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: () => {
					installEvent.prompt();
					setInstallEvent(null);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Instalar"]
			})]
		}) : null,
		showIosHint && online ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 border-b border-border bg-bg-elevated px-4 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-ink-muted",
				children: "En iPhone: Compartir y luego Añadir a pantalla de inicio."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-xs font-medium text-accent",
				onClick: () => setShowIosHint(false),
				children: "Entendido"
			})]
		}) : null
	] });
}
function recognitionCtor() {
	if (typeof window === "undefined") return null;
	const host = window;
	return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}
function canSpeak() {
	return typeof window !== "undefined" && "speechSynthesis" in window;
}
function canListen() {
	return recognitionCtor() !== null;
}
function pickVoice() {
	const voices = window.speechSynthesis.getVoices();
	return voices.find((voice) => voice.lang === "es-ES") ?? voices.find((voice) => voice.lang.startsWith("es")) ?? null;
}
function stopSpeaking() {
	if (!canSpeak()) return;
	window.speechSynthesis.cancel();
}
function speak(text) {
	if (!canSpeak() || !text.trim()) return false;
	stopSpeaking();
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = "es-ES";
	utterance.rate = 1;
	const voice = pickVoice();
	if (voice) utterance.voice = voice;
	else window.speechSynthesis.addEventListener("voiceschanged", () => {
		const next = pickVoice();
		if (next) utterance.voice = next;
	}, { once: true });
	window.speechSynthesis.speak(utterance);
	return true;
}
function startListening(handlers) {
	const Ctor = recognitionCtor();
	if (!Ctor) return null;
	const recognition = new Ctor();
	recognition.lang = "es-ES";
	recognition.interimResults = true;
	recognition.continuous = false;
	recognition.maxAlternatives = 1;
	recognition.onresult = (event) => {
		let interim = "";
		let finalText = "";
		for (let index = event.resultIndex; index < event.results.length; index += 1) {
			const piece = event.results[index];
			const transcript = piece[0]?.transcript ?? "";
			if (piece.isFinal) finalText += transcript;
			else interim += transcript;
		}
		if (interim) handlers.onPartial(interim.trim());
		if (finalText) handlers.onFinal(finalText.trim());
	};
	recognition.onend = handlers.onEnd;
	recognition.onerror = (event) => {
		handlers.onError(event.error === "not-allowed" ? "permiso" : "error");
	};
	recognition.start();
	return recognition;
}
function fold(value) {
	return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function findPatient(query, patients) {
	const needle = fold(query);
	if (!needle) return null;
	return patients.find((patient) => fold(patient.fullName) === needle) ?? patients.find((patient) => fold(patient.fullName).includes(needle)) ?? patients.find((patient) => fold(patient.firstName) === needle) ?? null;
}
function findStage(query) {
	const text = fold(query);
	if (/perdid|no insist/.test(text)) return "lost";
	if (/factur/.test(text)) return "invoiced";
	if (/seguimiento|revision|postoperatorio|cuidados/.test(text)) return "followup";
	if (/propuesta|presupuesto/.test(text)) return "proposal";
	if (/cita|confirm/.test(text)) return "confirmed";
	if (/cualif|por ia/.test(text)) return "qualified";
	if (/nuevo|contacto|entrada/.test(text)) return "new";
	return null;
}
function parseVoice(raw, patients) {
	const text = fold(raw);
	if (!text) return { type: "help" };
	if (/^(parar|silencio|calla|stop)$/.test(text)) return { type: "stop" };
	if (/ayuda|que puedo|comandos/.test(text)) return { type: "help" };
	if (/cerrar copiloto|cerrar panel/.test(text)) return { type: "close-copilot" };
	const move = text.match(/^(?:mover|pasa|pasar)\s+(.+?)\s+a\s+(.+)$/);
	if (move) {
		const patient = findPatient(move[1] ?? "", patients);
		const stage = findStage(move[2] ?? "");
		if (patient && stage) return {
			type: "move",
			id: patient.id,
			name: patient.fullName,
			stage
		};
	}
	const open = text.match(/^(?:abrir|abre|ficha(?:\s+de)?|ver)\s+(.+)$/);
	if (open) {
		const patient = findPatient(open[1] ?? "", patients);
		if (patient) return {
			type: "navigate",
			id: patient.id,
			name: patient.fullName
		};
	}
	const search = text.match(/^(?:buscar|busca|filtra)\s+(.+)$/);
	if (search) return {
		type: "search",
		query: (search[1] ?? "").trim()
	};
	if (/copiloto|asistente/.test(text)) {
		const prompt = raw.replace(/.*copiloto(?:\s+ia)?[,:]?\s*/i, "").trim();
		return {
			type: "open-copilot",
			prompt: prompt.length > 4 ? prompt : void 0
		};
	}
	if (/alarma|recordatorio/.test(text)) {
		const due = buildAlarms(patients).filter((alarm) => alarm.status === "due");
		return {
			type: "speak",
			text: due.length === 0 ? "No hay alarmas vencidas." : `Hay ${due.length} alarmas. ${due.slice(0, 4).map((alarm) => `${alarm.patientName}: ${alarm.title}`).join(". ")}.`
		};
	}
	if (/resumen|pipeline|tablero|que hay/.test(text)) return {
		type: "speak",
		text: pipelineScript(patients)
	};
	if (/leer|leeme|pantalla|oir/.test(text)) return {
		type: "speak",
		text: pipelineScript(patients)
	};
	const named = findPatient(text, patients);
	if (named) return {
		type: "navigate",
		id: named.id,
		name: named.fullName
	};
	return {
		type: "open-copilot",
		prompt: raw.trim()
	};
}
function pipelineScript(patients) {
	if (patients.length === 0) return "El pipeline está vacío.";
	const value = patients.filter((patient) => patient.stage !== "invoiced").reduce((sum, patient) => sum + patient.estimatedValue, 0);
	const counts = PIPELINE_STAGES.map((stage) => {
		const group = patients.filter((patient) => patient.stage === stage.id);
		const names = group.slice(0, 2).map((patient) => patient.fullName).join(", ");
		return `${stage.label}: ${group.length}${names ? `. ${names}` : ""}`;
	}).join(". ");
	return `Pipeline de AsexiA. ${patients.length} fichas. ${formatMoney(value)} en juego. ${counts}.`;
}
function patientScript(patient, events = []) {
	const last = [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
	const score = patient.aiScore ? ` Score de IA ${patient.aiScore}.` : "";
	const lastLine = last ? ` Último evento: ${last.title}. ${last.body.slice(0, 180)}` : "";
	return `Ficha de ${patient.fullName}. ${patient.treatmentInterest}. ${patient.phone}.${score} ${patient.notes}${lastLine}`;
}
var VOICE_HELP = "Puede decir: leer pantalla, alarmas de hoy, abrir Elena Ruiz, buscar implantes, mover Lucía a cita confirmada, o copiloto.";
function VoiceBar() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const queryClient = useQueryClient();
	const setSearch = useUiStore((state) => state.setSearch);
	const setCopilotOpen = useUiStore((state) => state.setCopilotOpen);
	const pushMessage = useUiStore((state) => state.pushMessage);
	const [listening, setListening] = (0, import_react.useState)(false);
	const [partial, setPartial] = (0, import_react.useState)("");
	const [speaking, setSpeaking] = (0, import_react.useState)(false);
	function patients() {
		return queryClient.getQueryData(["pipeline"]) ?? [];
	}
	async function say(text) {
		if (!canSpeak()) {
			toast.error("Este navegador no puede leer en voz alta");
			return;
		}
		setSpeaking(true);
		speak(text);
		window.setTimeout(() => setSpeaking(false), Math.min(12e3, 80 * text.length));
	}
	async function run(action) {
		if (action.type === "stop") {
			stopSpeaking();
			setSpeaking(false);
			return;
		}
		if (action.type === "help") {
			await say(VOICE_HELP);
			return;
		}
		if (action.type === "speak") {
			await say(action.text);
			return;
		}
		if (action.type === "search") {
			setSearch(action.query);
			navigate({ to: "/" });
			await say(`Busco ${action.query}.`);
			return;
		}
		if (action.type === "navigate") {
			navigate({
				to: "/pacientes/$id",
				params: { id: action.id }
			});
			await say(`Abro la ficha de ${action.name}.`);
			return;
		}
		if (action.type === "close-copilot") {
			setCopilotOpen(false);
			return;
		}
		if (action.type === "move") {
			await moveByVoice(action.id, action.name, action.stage);
			return;
		}
		setCopilotOpen(true);
		if (action.prompt) {
			pushMessage({
				id: `user-${Date.now()}`,
				role: "user",
				content: action.prompt,
				at: (/* @__PURE__ */ new Date()).toISOString()
			});
			const reply = await api.askCopilot(action.prompt, patients());
			pushMessage(reply);
			await say(reply.content);
		} else await say("Copiloto abierto. Diga la pregunta.");
	}
	async function moveByVoice(id, name, stage) {
		await api.movePatient(id, stage);
		queryClient.setQueryData(["pipeline"], (current) => (current ?? []).map((patient) => patient.id === id ? {
			...patient,
			stage
		} : patient));
		await say(`${name} movida a ${stageLabel(stage)}.`);
	}
	async function readScreen() {
		const list = patients();
		const match = pathname.match(/^\/pacientes\/([^/]+)/);
		if (match) {
			const id = decodeURIComponent(match[1] ?? "");
			const patient = queryClient.getQueryData(["patient", id]) ?? list.find((item) => item.id === id);
			if (!patient) {
				await say("Todavía no tengo la ficha cargada.");
				return;
			}
			await say(patientScript(patient, queryClient.getQueryData(["timeline", id]) ?? []));
			return;
		}
		await say(list.length ? pipelineScript(list) : "El tablero aún se está cargando.");
	}
	function listen() {
		if (!canListen()) {
			toast.error("Este navegador no admite dictado. En el móvil, use Chrome o Safari.");
			return;
		}
		stopSpeaking();
		setSpeaking(false);
		setPartial("");
		if (!startListening({
			onPartial: setPartial,
			onFinal: (text) => {
				setPartial(text);
				run(parseVoice(text, patients()));
			},
			onEnd: () => setListening(false),
			onError: (message) => {
				setListening(false);
				toast.error(message === "permiso" ? "Permita el micrófono para dar órdenes" : "No se pudo oír");
			}
		})) return;
		setListening(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "voice-dock fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 pr-32",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => {
					if (speaking) {
						stopSpeaking();
						setSpeaking(false);
						return;
					}
					readScreen();
				},
				className: "flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-accent-soft text-sm font-medium text-accent",
				"aria-label": speaking ? "Parar lectura" : "Oír la pantalla",
				children: [speaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), speaking ? "Leyendo" : "Oír"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: listen,
				"aria-pressed": listening,
				"aria-label": "Dar una instrucción por voz",
				className: cn("flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium", listening ? "bg-accent text-accent-fg" : "bg-ink text-accent-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: cn("size-4", listening && "voice-pulse") }), listening ? "Escuchando" : "Hablar"]
			})]
		}), partial ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 pb-2 text-center text-xs text-ink-muted",
			children: partial
		}) : null]
	});
}
function stageLabel(stage) {
	return stageMeta(stage).label.toLowerCase();
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border outline-none transition-[box-shadow] duration-quick ease-out-smooth placeholder:text-ink-subtle focus-visible:ring-2 focus-visible:ring-accent/35", className),
		suppressHydrationWarning: true,
		...props
	});
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const isHome = pathname === "/";
	const search = useUiStore((state) => state.search);
	const setSearch = useUiStore((state) => state.setSearch);
	const role = useUiStore((state) => state.role);
	const setRole = useUiStore((state) => state.setRole);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 border-b border-border/80 bg-bg/90 backdrop-blur-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChrome, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AsexiAMark, { className: "size-8 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-lg leading-none font-medium tracking-tight text-ink",
									children: "AsexiA"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "label-kicker mt-0.5 block",
									children: "Suite 360"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ml-auto hidden items-center gap-4 text-xs text-ink-muted sm:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AsexiA Castellana" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-2 sm:px-6",
						children: [
							["direccion", "Dirección"],
							["recepcion", "Recepción"],
							["medico", "Médico"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRole(id),
							className: cn("inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-medium", role === id ? "bg-ink text-accent-fg" : "text-ink-muted"),
							children: label
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6",
						children: [
							{
								to: "/",
								label: "Tablero",
								roles: ["direccion", "recepcion"]
							},
							{
								to: "/mandos",
								label: "Mandos",
								roles: ["direccion"]
							},
							{
								to: "/agenda",
								label: "Agenda",
								roles: [
									"direccion",
									"recepcion",
									"medico"
								]
							},
							{
								to: "/admin",
								label: "Admin",
								roles: ["direccion"]
							}
						].filter((link) => link.roles.includes(role)).map((link) => {
							const active = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								className: cn("inline-flex h-10 shrink-0 items-center rounded-full px-3 text-sm font-medium", active ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"),
								children: link.label
							}, link.to);
						})
					}),
					isHome ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto flex max-w-7xl items-center gap-3 px-4 pb-3 sm:px-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: search,
								onChange: (event) => setSearch(event.target.value),
								placeholder: "Buscar paciente, tratamiento o responsable",
								className: "pl-10",
								"aria-label": "Buscar en el pipeline"
							})]
						})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: cn("mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6", "pb-40"),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopilotFab, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopilotDrawer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				toastOptions: { className: "!bg-surface !text-ink !border-border !shadow-overlay !font-sans" }
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var queryClient = new QueryClient({ defaultOptions: { queries: {
	staleTime: 3e4,
	refetchOnWindowFocus: false,
	retry: 0
} } });
var styles_default = "/assets/styles-i-ttinWs.css";
var APP_NAME = "AsexiA Suite 360";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Gestión comercial y operativa de clínicas. Pipeline, ficha 360 y copiloto IA."
			},
			{
				name: "theme-color",
				content: "#1e4d48"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "AsexiA"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;1,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "es",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
				client: queryClient,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$4 = () => import("./routes-DBeFHjnd.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin-DcbVdUbJ.mjs");
var Route$3 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./agenda-CXEsXODs.mjs");
var Route$2 = createFileRoute("/agenda")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./mandos-Cy90SRYC.mjs");
var Route$1 = createFileRoute("/mandos")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./pacientes._id-fyzAVFQI.mjs");
var Route = createFileRoute("/pacientes/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	AdminRoute: Route$3.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$5
	}),
	AgendaRoute: Route$2.update({
		id: "/agenda",
		path: "/agenda",
		getParentRoute: () => Route$5
	}),
	MandosRoute: Route$1.update({
		id: "/mandos",
		path: "/mandos",
		getParentRoute: () => Route$5
	}),
	PacientesIdRoute: Route.update({
		id: "/pacientes/$id",
		path: "/pacientes/$id",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { useUiStore as a, cn as c, stageMeta as d, Button as i, formatMoney as l, Route as n, PIPELINE_STAGES as o, Input as r, api as s, router_exports as t, initials as u };
