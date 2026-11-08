//#region node_modules/.nitro/vite/services/ssr/assets/clinic-BBb0I11m.js
var ACTIVITY_COLORS = [
	"#1C3D36",
	"#3D4F7C",
	"#8A5A2B",
	"#1F6B4A",
	"#6B3A4A",
	"#0E6B6B",
	"#4A5C3A",
	"#C45C26"
];
var DAY_LABEL = [
	"Domingo",
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado"
];
function weekHours(open, close, closedDays) {
	return [
		1,
		2,
		3,
		4,
		5,
		6,
		0
	].map((day) => ({
		day,
		label: DAY_LABEL[day] ?? "Día",
		open,
		close,
		closed: closedDays.includes(day)
	}));
}
var PRESET = {
	armonizacion: {
		cost: 780,
		color: "#1C3D36",
		code: "01",
		professionalIds: ["elena"],
		recallDays: 180
	},
	implantes: {
		cost: 4100,
		color: "#3D4F7C",
		code: "02",
		professionalIds: ["raquel"],
		recallDays: 7
	},
	"laser-co2": {
		cost: 420,
		color: "#0E6B6B",
		code: "03",
		professionalIds: ["elena"],
		recallDays: 30
	},
	blefaro: {
		cost: 1600,
		color: "#6B3A4A",
		code: "04",
		professionalIds: ["inigo"],
		recallDays: 15
	},
	rino: {
		cost: 3400,
		color: "#8A5A2B",
		code: "05",
		professionalIds: ["inigo"],
		recallDays: 15
	},
	botox: {
		cost: 210,
		color: "#1F6B4A",
		code: "06",
		professionalIds: ["elena"],
		recallDays: 120
	},
	capilar: {
		cost: 640,
		color: "#4A5C3A",
		code: "07",
		professionalIds: ["elena"],
		recallDays: 30
	},
	invisalign: {
		cost: 1800,
		color: "#3D4F7C",
		code: "08",
		professionalIds: ["raquel"]
	},
	"laser-vascular": {
		cost: 380,
		color: "#0E6B6B",
		code: "09",
		professionalIds: ["elena"],
		recallDays: 30
	},
	rejuvenecimiento: {
		cost: 1900,
		color: "#C45C26",
		code: "10",
		professionalIds: ["inigo", "elena"],
		recallDays: 90
	},
	hidrafacial: {
		cost: 40,
		color: "#1F6B4A",
		code: "11",
		professionalIds: ["clara"],
		recallDays: 28
	},
	revision: {
		cost: 0,
		color: "#4A5C3A",
		code: "12",
		professionalIds: [
			"elena",
			"inigo",
			"raquel"
		]
	},
	protesis: {
		cost: 1400,
		color: "#3D4F7C",
		code: "13",
		professionalIds: ["raquel"],
		recallDays: 7
	}
};
function defaultProfessionals() {
	return [
		{
			id: "elena",
			name: "Dra. Elena Marín",
			specialty: "Medicina estética",
			phone: "+34 610 220 114",
			email: "elena.marin@asexia.clinic",
			color: "#1C3D36",
			license: "28/34521",
			cv: "Doce años en facial no quirúrgico. Formación en armonización y láser.",
			hours: weekHours("10:00", "14:00", [0, 6]),
			activityCosts: []
		},
		{
			id: "inigo",
			name: "Dr. Íñigo Salas",
			specialty: "Cirugía",
			phone: "+34 610 220 208",
			email: "inigo.salas@asexia.clinic",
			color: "#8A5A2B",
			license: "28/29810",
			cv: "Cirugía facial. Quirófano de tarde, de lunes a jueves.",
			hours: weekHours("15:00", "20:00", [
				0,
				5,
				6
			]),
			activityCosts: [{
				activityId: "rino",
				cost: 3600
			}]
		},
		{
			id: "raquel",
			name: "Raquel Vidal",
			specialty: "Odontología",
			phone: "+34 610 220 301",
			email: "raquel.vidal@asexia.clinic",
			color: "#3D4F7C",
			license: "28/41002",
			cv: "Implantes y prótesis. Responsable del box dental.",
			hours: weekHours("10:00", "18:00", [0, 6]),
			activityCosts: []
		},
		{
			id: "clara",
			name: "Clara Méndez",
			specialty: "Facial",
			phone: "+34 610 220 418",
			email: "clara.mendez@asexia.clinic",
			color: "#1F6B4A",
			cv: "Cabina facial. Packs y mantenimiento.",
			hours: weekHours("10:00", "14:00", [0, 1]),
			activityCosts: []
		}
	];
}
function normalizeCatalog(input) {
	return {
		activities: (input?.activities ?? []).map((activity, index) => {
			const preset = PRESET[activity.id];
			return {
				id: activity.id,
				sector: activity.sector ?? "",
				subsector: activity.subsector ?? "",
				name: activity.name ?? "Actividad",
				description: activity.description ?? "",
				durationMin: activity.durationMin ?? 30,
				price: activity.price ?? 0,
				cost: activity.cost ?? preset?.cost ?? 0,
				color: activity.color ?? preset?.color ?? ACTIVITY_COLORS[index % ACTIVITY_COLORS.length],
				code: activity.code ?? preset?.code ?? String(index + 1).padStart(2, "0"),
				links: activity.links ?? [],
				professionalIds: activity.professionalIds ?? preset?.professionalIds ?? [],
				files: activity.files ?? [],
				recallDays: activity.recallDays ?? preset?.recallDays
			};
		}),
		rooms: input?.rooms ?? [],
		hours: input?.hours ?? weekHours("10:00", "20:00", [0]),
		professionals: input?.professionals?.length ? input.professionals : defaultProfessionals()
	};
}
function blankActivity(index) {
	return {
		id: `act-${Date.now()}`,
		sector: "Medicina estética",
		subsector: "Facial",
		name: "Nueva actividad",
		description: "",
		durationMin: 30,
		price: 0,
		cost: 0,
		color: ACTIVITY_COLORS[index % ACTIVITY_COLORS.length] ?? "#1C3D36",
		code: String(index + 1).padStart(2, "0"),
		links: [],
		professionalIds: []
	};
}
function blankProfessional() {
	return {
		id: `pro-${Date.now()}`,
		name: "Nuevo profesional",
		specialty: "",
		phone: "",
		email: "",
		color: "#1C3D36",
		hours: weekHours("10:00", "14:00", [0, 6]),
		activityCosts: []
	};
}
function activityCost(catalog, activityId, professionalName) {
	const activity = catalog.activities.find((item) => item.id === activityId);
	return (catalog.professionals.find((item) => item.name === professionalName)?.activityCosts.find((item) => item.activityId === activityId))?.cost ?? activity?.cost ?? 0;
}
function allVisits(patients) {
	return patients.flatMap((patient) => (patient.visits ?? []).map((visit) => ({
		...visit,
		patientId: patient.id,
		patientName: patient.fullName
	})));
}
function allPayments(patients) {
	return patients.flatMap((patient) => (patient.payments ?? []).map((payment) => ({
		...payment,
		patientId: patient.id,
		patientName: patient.fullName
	})));
}
function sameDay(iso, day) {
	const date = new Date(iso);
	return date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate();
}
function openMinutes(catalog, day) {
	const spec = catalog.hours.find((item) => item.day === day.getDay());
	if (!spec || spec.closed) return 0;
	const [openHour, openMinute] = spec.open.split(":").map(Number);
	const [closeHour, closeMinute] = spec.close.split(":").map(Number);
	return Math.max(0, closeHour * 60 + closeMinute - (openHour * 60 + openMinute));
}
function occupancy(patients, catalog, day) {
	const minutes = openMinutes(catalog, day);
	const capacity = minutes * Math.max(1, catalog.rooms.length);
	const visits = allVisits(patients).filter((visit) => sameDay(visit.at, day) && visit.status !== "cancelada" && visit.status !== "ausente").sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
	const booked = visits.reduce((sum, visit) => sum + visit.durationMin, 0);
	return {
		capacity,
		booked,
		ratio: minutes === 0 ? 0 : Math.min(1, booked / capacity),
		visits,
		closed: minutes === 0
	};
}
function startOfDay(date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}
function addDays(date, days) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}
function minutes(value) {
	const [hour, minute] = value.split(":").map(Number);
	return (hour ?? 0) * 60 + (minute ?? 0);
}
function overlaps(start, durationMin, otherStart, otherDuration) {
	return start < otherStart + otherDuration * 6e4 && otherStart < start + durationMin * 6e4;
}
function scheduleProblem(patients, catalog, draft) {
	const at = new Date(draft.at);
	if (Number.isNaN(at.getTime())) return "La fecha no es válida.";
	const day = catalog.hours.find((item) => item.day === at.getDay());
	if (!day || day.closed) return "La clínica está cerrada ese día.";
	const clock = at.getHours() * 60 + at.getMinutes();
	if (clock < minutes(day.open) || clock + draft.durationMin > minutes(day.close)) return `Fuera del horario de la clínica (${day.open}–${day.close}).`;
	const professional = catalog.professionals.find((item) => item.name === draft.professional);
	const attention = professional?.hours.find((item) => item.day === at.getDay());
	if (professional && (!attention || attention.closed)) return `${professional.name} no atiende ese día.`;
	if (attention && (clock < minutes(attention.open) || clock + draft.durationMin > minutes(attention.close))) return `${professional?.name} atiende de ${attention.open} a ${attention.close}.`;
	const start = at.getTime();
	for (const visit of allVisits(patients)) {
		if (visit.id === draft.ignoreVisitId) continue;
		if (visit.status === "cancelada" || visit.status === "ausente") continue;
		const other = new Date(visit.at).getTime();
		if (!overlaps(start, draft.durationMin, other, visit.durationMin)) continue;
		if (visit.roomId === draft.roomId) return `${visit.roomName} ya tiene cita a esa hora.`;
		if (visit.professional === draft.professional) return `${draft.professional} ya tiene cita a esa hora.`;
	}
	return null;
}
function firstOpening(patients, catalog, day, durationMin, roomId, professional) {
	const clinic = catalog.hours.find((item) => item.day === day.getDay());
	if (!clinic || clinic.closed) return null;
	let from = minutes(clinic.open);
	let to = minutes(clinic.close);
	const person = catalog.professionals.find((item) => item.name === professional);
	const attention = person?.hours.find((item) => item.day === day.getDay());
	if (person && (!attention || attention.closed)) return null;
	if (attention) {
		from = Math.max(from, minutes(attention.open));
		to = Math.min(to, minutes(attention.close));
	}
	for (let cursor = from; cursor + durationMin <= to; cursor += 15) {
		const at = new Date(day);
		at.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
		if (!scheduleProblem(patients, catalog, {
			at: at.toISOString(),
			durationMin,
			roomId,
			professional
		})) return at.toISOString();
	}
	return null;
}
var PAY_METHODS = [
	"efectivo",
	"tarjeta",
	"transferencia"
];
var METHOD_LABEL = {
	efectivo: "Efectivo",
	tarjeta: "Tarjeta",
	transferencia: "Transferencia"
};
function dayKey(input = /* @__PURE__ */ new Date()) {
	const date = typeof input === "string" ? new Date(input) : input;
	if (Number.isNaN(date.getTime())) return "";
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}
function emptyMethods() {
	return {
		efectivo: 0,
		tarjeta: 0,
		transferencia: 0
	};
}
function isDayClosed(closes, day) {
	return closes.some((item) => item.day === day);
}
function previstoByMethod(patients, day) {
	const totals = emptyMethods();
	for (const patient of patients) for (const payment of patient.payments ?? []) {
		if (payment.status !== "cobrado" || !payment.paidAt) continue;
		if (dayKey(payment.paidAt) !== day) continue;
		const method = payment.method ?? "efectivo";
		totals[method] += payment.amount;
	}
	return totals;
}
function tpvByMethod(lines, day) {
	const totals = emptyMethods();
	for (const line of lines) {
		if (line.day !== day) continue;
		totals[line.method] += line.amount;
	}
	return totals;
}
function defaultStock() {
	return [
		{
			id: "stock-botox",
			name: "Vial de toxina",
			unit: "vial",
			quantity: 12,
			min: 4,
			activityId: "botox",
			perVisit: 1
		},
		{
			id: "stock-canula",
			name: "Cánula facial",
			unit: "ud",
			quantity: 24,
			min: 8,
			activityId: "botox",
			perVisit: 1
		},
		{
			id: "stock-suero",
			name: "Suero hidrafacial",
			unit: "ud",
			quantity: 10,
			min: 4,
			activityId: "hidrafacial",
			perVisit: 1
		}
	];
}
function defaultPacks() {
	return [{
		id: "pack-hidra",
		name: "Hidrafacial × 4",
		summary: "Cuatro sesiones. Al marcar una como hecha queda citada la siguiente, 28 días después.",
		steps: [
			1,
			2,
			3,
			4
		].map((session) => ({
			id: `hidra-${session}`,
			activityId: "hidrafacial",
			action: `Sesión ${session} de 4. Limpieza, extracción y suero.`,
			afterDays: 28
		}))
	}];
}
function refreshAppointment(patient) {
	patient.appointmentAt = (patient.visits ?? []).filter((visit) => visit.status === "programada").map((visit) => visit.at).sort()[0];
}
function nid(prefix) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
function applyReply(input) {
	const patients = structuredClone(input.patients);
	let waitlist = structuredClone(input.waitlist);
	const patient = patients.find((item) => item.id === input.patientId);
	if (!patient) return {
		patients,
		waitlist,
		message: "No encontramos la ficha."
	};
	const visit = [...patient.visits ?? []].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()).find((item) => item.status === "programada");
	if (!visit) return {
		patients,
		waitlist,
		message: "No hay una cita pendiente de confirmar."
	};
	if (input.answer === "confirmada") {
		visit.confirmation = "confirmada";
		if (patient.stage !== "lost" && patient.stage !== "invoiced") patient.stage = "confirmed";
		return {
			patients,
			waitlist,
			message: "Cita confirmada."
		};
	}
	visit.status = "cancelada";
	visit.confirmation = "no-puede";
	refreshAppointment(patient);
	const waiter = waitlist.find((item) => item.activityId === visit.activityId);
	if (!waiter) return {
		patients,
		waitlist,
		message: "Cita soltada. Nadie esperaba ese tratamiento."
	};
	const nextPatient = patients.find((item) => item.id === waiter.patientId);
	const activity = input.catalog.activities.find((item) => item.id === visit.activityId);
	if (!nextPatient || !activity) return {
		patients,
		waitlist,
		message: "Cita soltada."
	};
	const professional = nextPatient.assignedTo || visit.professional;
	const at = firstOpening(patients, input.catalog, new Date(visit.at), activity.durationMin, visit.roomId, professional);
	if (!at) return {
		patients,
		waitlist,
		message: "Cita soltada. El primero de la lista no cabe en ese hueco."
	};
	const room = input.catalog.rooms.find((item) => item.id === visit.roomId);
	nextPatient.visits = [...nextPatient.visits ?? [], {
		id: nid("visit"),
		at,
		activityId: activity.id,
		activityName: activity.name,
		roomId: visit.roomId,
		roomName: room?.name ?? visit.roomName,
		durationMin: activity.durationMin,
		professional,
		status: "programada",
		notes: "Hueco liberado. Entra desde la lista de espera.",
		price: activity.price,
		confirmation: "pendiente"
	}];
	refreshAppointment(nextPatient);
	if (nextPatient.stage !== "lost") nextPatient.stage = "confirmed";
	waitlist = waitlist.filter((item) => item.id !== waiter.id);
	return {
		patients,
		waitlist,
		message: `Cita soltada. El hueco pasa a ${nextPatient.fullName}.`
	};
}
function openingSoon(patients, catalog, start, durationMin, roomId, professional) {
	for (let offset = 0; offset < 21; offset += 1) {
		const day = new Date(start);
		day.setDate(day.getDate() + offset);
		const at = firstOpening(patients, catalog, day, durationMin, roomId, professional);
		if (at) return at;
	}
	return null;
}
function applyVisitStatus(input) {
	const patients = structuredClone(input.patients);
	const stock = structuredClone(input.stock);
	let waitlist = structuredClone(input.waitlist);
	const patient = patients.find((item) => item.id === input.patientId);
	const visit = patient?.visits?.find((item) => item.id === input.visitId);
	if (!patient || !visit) return {
		patients,
		waitlist,
		stock,
		note: ""
	};
	const wasDone = visit.status === "realizada";
	visit.status = input.status;
	if (input.status === "cancelada") visit.confirmation = "no-puede";
	refreshAppointment(patient);
	if (input.status !== "realizada" || wasDone) return {
		patients,
		waitlist,
		stock,
		note: ""
	};
	if (!visit.stockApplied) {
		for (const item of stock) {
			if (!item.activityId || item.activityId !== visit.activityId || item.perVisit <= 0) continue;
			item.quantity = Math.max(0, item.quantity - item.perVisit);
		}
		visit.stockApplied = true;
	}
	let note = "";
	for (const plan of patient.plans ?? []) {
		const index = plan.steps.findIndex((step) => step.status === "pendiente" && step.activityId === visit.activityId && !step.visitId);
		if (index < 0) continue;
		plan.steps[index] = {
			...plan.steps[index],
			status: "hecha",
			visitId: visit.id
		};
		const next = plan.steps[index + 1];
		if (!next || next.status === "hecha") break;
		if ((patient.visits ?? []).some((item) => item.status === "programada" && item.activityId === next.activityId)) {
			note = "Sesión hecha. La siguiente ya estaba en agenda.";
			break;
		}
		const activity = input.catalog.activities.find((item) => item.id === next.activityId);
		if (!activity) break;
		const start = new Date(visit.at);
		start.setDate(start.getDate() + (next.afterDays || 28));
		const professional = plan.professional || visit.professional;
		const at = openingSoon(patients, input.catalog, start, activity.durationMin, visit.roomId, professional);
		if (!at) {
			waitlist = [{
				id: nid("wait"),
				patientId: patient.id,
				patientName: patient.fullName,
				activityId: activity.id,
				activityName: activity.name,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, ...waitlist];
			note = "Sesión hecha. No había hueco: queda en lista de espera.";
			break;
		}
		const room = input.catalog.rooms.find((item) => item.id === visit.roomId);
		patient.visits = [...patient.visits ?? [], {
			id: nid("visit"),
			at,
			activityId: activity.id,
			activityName: activity.name,
			roomId: visit.roomId,
			roomName: room?.name ?? visit.roomName,
			durationMin: activity.durationMin,
			professional,
			status: "programada",
			notes: next.action,
			price: activity.price,
			confirmation: "pendiente"
		}];
		refreshAppointment(patient);
		note = "Sesión hecha. La siguiente queda programada.";
		break;
	}
	return {
		patients,
		waitlist,
		stock,
		note
	};
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
function seedCatalog() {
	return normalizeCatalog({
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
	});
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
					id: "marta-miss",
					at: daysAgo(8),
					activityId: "hidrafacial",
					activityName: "Hidrafacial",
					roomId: "sala-1",
					roomName: "Sala 1 · Facial",
					durationMin: 50,
					professional: "Clara Méndez",
					status: "ausente",
					notes: "No acudió. Hueco liberado.",
					price: 0
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
//#endregion
export { wait as A, occupancy as C, seedCatalog as D, scheduleProblem as E, startOfDay as O, normalizeCatalog as S, sameDay as T, firstOpening as _, addDays as a, isDayClosed as b, applyReply as c, blankActivity as d, blankProfessional as f, defaultStock as g, defaultPacks as h, activityCost as i, tpvByMethod as k, applyVisitStatus as l, daysAgo as m, METHOD_LABEL as n, allPayments as o, dayKey as p, PAY_METHODS as r, allVisits as s, ACTIVITY_COLORS as t, attachClinic as u, hoursAgo as v, previstoByMethod as w, minutesAgo as x, hoursFromNow as y };
