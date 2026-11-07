import type { ClinicCatalog, Patient, PlannedPayment, Visit } from "@/lib/api/types";

export type AgendaVisit = Visit & { patientId: string; patientName: string };
export type AgendaPayment = PlannedPayment & { patientId: string; patientName: string };

export function allVisits(patients: Patient[]): AgendaVisit[] {
  return patients.flatMap((patient) =>
    (patient.visits ?? []).map((visit) => ({
      ...visit,
      patientId: patient.id,
      patientName: patient.fullName,
    })),
  );
}

export function allPayments(patients: Patient[]): AgendaPayment[] {
  return patients.flatMap((patient) =>
    (patient.payments ?? []).map((payment) => ({
      ...payment,
      patientId: patient.id,
      patientName: patient.fullName,
    })),
  );
}

export function sameDay(iso: string, day: Date) {
  const date = new Date(iso);
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

export function openMinutes(catalog: ClinicCatalog, day: Date) {
  const spec = catalog.hours.find((item) => item.day === day.getDay());
  if (!spec || spec.closed) return 0;
  const [openHour, openMinute] = spec.open.split(":").map(Number);
  const [closeHour, closeMinute] = spec.close.split(":").map(Number);
  return Math.max(0, closeHour * 60 + closeMinute - (openHour * 60 + openMinute));
}

export function occupancy(patients: Patient[], catalog: ClinicCatalog, day: Date) {
  const minutes = openMinutes(catalog, day);
  const capacity = minutes * Math.max(1, catalog.rooms.length);
  const visits = allVisits(patients)
    .filter((visit) => sameDay(visit.at, day) && visit.status !== "cancelada")
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const booked = visits.reduce((sum, visit) => sum + visit.durationMin, 0);
  return {
    capacity,
    booked,
    ratio: minutes === 0 ? 0 : Math.min(1, booked / capacity),
    visits,
    closed: minutes === 0,
  };
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
