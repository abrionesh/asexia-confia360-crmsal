//#region node_modules/.nitro/vite/services/ssr/assets/occupancy-BwI6lpZa.js
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
	const visits = allVisits(patients).filter((visit) => sameDay(visit.at, day) && visit.status !== "cancelada").sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
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
//#endregion
export { startOfDay as a, sameDay as i, allPayments as n, occupancy as r, addDays as t };
