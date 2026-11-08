import type { ClinicCatalog, Patient } from "@/lib/api/types";
import { allVisits, sameDay } from "@/lib/occupancy";

export interface SlotDraft {
  at: string;
  durationMin: number;
  roomId: string;
  professional: string;
  ignoreVisitId?: string;
}

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

function overlaps(start: number, durationMin: number, otherStart: number, otherDuration: number) {
  return start < otherStart + otherDuration * 60_000 && otherStart < start + durationMin * 60_000;
}

export function scheduleProblem(patients: Patient[], catalog: ClinicCatalog, draft: SlotDraft) {
  const at = new Date(draft.at);
  if (Number.isNaN(at.getTime())) return "La fecha no es válida.";
  const day = catalog.hours.find((item) => item.day === at.getDay());
  if (!day || day.closed) return "La clínica está cerrada ese día.";
  const clock = at.getHours() * 60 + at.getMinutes();
  if (clock < minutes(day.open) || clock + draft.durationMin > minutes(day.close)) {
    return `Fuera del horario de la clínica (${day.open}–${day.close}).`;
  }
  const professional = catalog.professionals.find((item) => item.name === draft.professional);
  const attention = professional?.hours.find((item) => item.day === at.getDay());
  if (professional && (!attention || attention.closed)) return `${professional.name} no atiende ese día.`;
  if (attention && (clock < minutes(attention.open) || clock + draft.durationMin > minutes(attention.close))) {
    return `${professional?.name} atiende de ${attention.open} a ${attention.close}.`;
  }
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

export function firstOpening(
  patients: Patient[],
  catalog: ClinicCatalog,
  day: Date,
  durationMin: number,
  roomId: string,
  professional: string,
) {
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
    if (!scheduleProblem(patients, catalog, { at: at.toISOString(), durationMin, roomId, professional })) {
      return at.toISOString();
    }
  }
  return null;
}

export function dayVisits(patients: Patient[], day: Date) {
  return allVisits(patients).filter((visit) => sameDay(visit.at, day));
}
