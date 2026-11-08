//#region node_modules/.nitro/vite/services/ssr/assets/export-csv-DfQ_xBiD.js
function cell(value) {
	return `"${String(value).replaceAll("\"", "\"\"")}"`;
}
function downloadPeriodCsv(patients, from, to) {
	const rows = ["paciente,cita,actividad,profesional,sala,estado,precio,cobrado,pendiente"];
	for (const patient of patients) {
		const collected = (patient.payments ?? []).filter((item) => item.status === "cobrado").reduce((sum, item) => sum + item.amount, 0);
		const pending = (patient.payments ?? []).filter((item) => item.status === "pendiente").reduce((sum, item) => sum + item.amount, 0);
		const visits = (patient.visits ?? []).filter((visit) => {
			const time = new Date(visit.at).getTime();
			return time >= from.getTime() && time < to.getTime();
		});
		if (visits.length === 0) continue;
		for (const visit of visits) rows.push([
			patient.fullName,
			visit.at,
			visit.activityName,
			visit.professional,
			visit.roomName,
			visit.status,
			visit.price,
			collected,
			pending
		].map(cell).join(","));
	}
	const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "clinica-periodo.csv";
	link.click();
	URL.revokeObjectURL(url);
}
function downloadPatientFile(patient, timeline) {
	const blob = new Blob([JSON.stringify({
		patient,
		timeline
	}, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${patient.id}.json`;
	link.click();
	URL.revokeObjectURL(url);
}
//#endregion
export { downloadPeriodCsv as n, downloadPatientFile as t };
