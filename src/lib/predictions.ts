import { PIPELINE_STAGES, type ClinicCatalog, type Patient } from "@/lib/api";
import { addDays, occupancy, startOfDay } from "@/lib/occupancy";
import { formatMoney } from "@/lib/utils";

export interface Prediction {
  id: string;
  title: string;
  reason: string;
  patientId?: string;
  to?: "/agenda" | "/mandos";
}

const SURGICAL = new Set(["rino", "blefaro", "implantes"]);

export function buildPredictions(patients: Patient[], catalog: ClinicCatalog, now = new Date()): Prediction[] {
  const items: Prediction[] = [];
  const tomorrow = addDays(startOfDay(now), 1);
  const day = occupancy(patients, catalog, tomorrow);
  if (!day.closed && day.capacity > 0 && day.ratio < 0.35) {
    items.push({
      id: "hueco",
      title: "Hueco en la agenda de mañana",
      reason: `${Math.round(day.ratio * 100)}% de ocupación. Quedan ${Math.max(0, day.capacity - day.booked)} minutos libres.`,
      to: "/agenda",
    });
  }

  for (const patient of patients) {
    if (patient.stage === "lost") continue;
    const visits = patient.visits ?? [];
    const upcoming = visits.filter((visit) => visit.status === "programada" && new Date(visit.at).getTime() > now.getTime());
    const idleDays = (now.getTime() - new Date(patient.lastActivityAt).getTime()) / 86_400_000;
    const stage = PIPELINE_STAGES.find((item) => item.id === patient.stage)?.label ?? patient.stage;

    if (visits.some((visit) => visit.status === "ausente") && upcoming.length > 0) {
      items.push({
        id: `noshow-${patient.id}`,
        title: "Riesgo de no asistencia",
        reason: `${patient.fullName} ya faltó a una cita y tiene otra prevista.`,
        patientId: patient.id,
      });
    }
    if ((patient.stage === "new" || patient.stage === "qualified" || patient.stage === "proposal") && idleDays >= 3) {
      items.push({
        id: `frio-${patient.id}`,
        title: "Lead enfriándose",
        reason: `${patient.fullName} lleva ${Math.floor(idleDays)} días en ${stage} sin movimiento.`,
        patientId: patient.id,
      });
    }
    if (patient.stage === "proposal" && patient.estimatedValue >= 3000 && idleDays >= 2) {
      items.push({
        id: `ticket-${patient.id}`,
        title: "Presupuesto alto parado",
        reason: `${patient.fullName} · ${formatMoney(patient.estimatedValue)} sigue en propuesta.`,
        patientId: patient.id,
      });
    }
    for (const payment of patient.payments ?? []) {
      if (payment.status !== "pendiente") continue;
      const due = new Date(payment.dueAt).getTime();
      if (due > now.getTime() + 2 * 86_400_000) continue;
      items.push({
        id: `pay-${payment.id}`,
        title: due < now.getTime() ? "Cobro vencido" : "Cobro a punto de vencer",
        reason: `${patient.fullName} · ${payment.concept} · ${formatMoney(payment.amount)}`,
        patientId: patient.id,
      });
    }
    if (!patient.consentSigned && upcoming.some((visit) => SURGICAL.has(visit.activityId))) {
      items.push({
        id: `consent-${patient.id}`,
        title: "Falta el consentimiento",
        reason: `${patient.fullName} tiene una cirugía prevista y la ficha no está firmada.`,
        patientId: patient.id,
      });
    }
    const done = visits
      .filter((visit) => visit.status === "realizada")
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
    if (
      done &&
      upcoming.length === 0 &&
      done.activityId !== "revision" &&
      now.getTime() - new Date(done.at).getTime() > 14 * 86_400_000
    ) {
      items.push({
        id: `review-${patient.id}`,
        title: "Revisión sin programar",
        reason: `${patient.fullName} terminó ${done.activityName} y no tiene otra cita.`,
        patientId: patient.id,
      });
    }
  }

  return items;
}
