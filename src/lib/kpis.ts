import type { ClinicCatalog, Patient } from "@/lib/api/types";
import { activityCost } from "@/lib/catalog";
import { allVisits, occupancy } from "@/lib/occupancy";

export type PeriodId = "hoy" | "semana" | "mes" | "fechas";

export function periodRange(id: PeriodId, from: Date, to: Date, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (id === "hoy") {
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
  if (id === "semana") {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
  if (id === "mes") {
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return { start: monthStart, end: monthEnd };
  }
  const rangeStart = new Date(from);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(to);
  rangeEnd.setHours(0, 0, 0, 0);
  rangeEnd.setDate(rangeEnd.getDate() + 1);
  return { start: rangeStart, end: rangeEnd };
}

function inside(iso: string, start: Date, end: Date) {
  const time = new Date(iso).getTime();
  return time >= start.getTime() && time < end.getTime();
}

export interface KpiBundle {
  clients: { id: string; name: string; visits: number }[];
  absences: { id: string; name: string; activity: string; at: string }[];
  income: number;
  collected: number;
  pending: number;
  collectedRows: { name: string; concept: string; amount: number }[];
  pendingRows: { name: string; concept: string; amount: number }[];
  treatments: { id: string; name: string; code: string; color: string; count: number; income: number; cost: number }[];
  cost: number;
  booked: number;
  capacity: number;
}

export function buildKpis(patients: Patient[], catalog: ClinicCatalog, start: Date, end: Date): KpiBundle {
  const visits = allVisits(patients).filter((visit) => inside(visit.at, start, end));
  const attended = visits.filter((visit) => visit.status !== "cancelada" && visit.status !== "ausente");
  const clients = new Map<string, { id: string; name: string; visits: number }>();
  for (const visit of attended) {
    const current = clients.get(visit.patientId) ?? { id: visit.patientId, name: visit.patientName, visits: 0 };
    current.visits += 1;
    clients.set(visit.patientId, current);
  }
  const treatments = new Map<string, KpiBundle["treatments"][number]>();
  let income = 0;
  let cost = 0;
  for (const visit of attended) {
    const activity = catalog.activities.find((item) => item.id === visit.activityId);
    const row = treatments.get(visit.activityId) ?? {
      id: visit.activityId,
      name: visit.activityName,
      code: activity?.code ?? "",
      color: activity?.color ?? "#1C3D36",
      count: 0,
      income: 0,
      cost: 0,
    };
    const visitCost = activityCost(catalog, visit.activityId, visit.professional);
    row.count += 1;
    row.income += visit.price;
    row.cost += visitCost;
    income += visit.price;
    cost += visitCost;
    treatments.set(visit.activityId, row);
  }
  let collected = 0;
  let pending = 0;
  const collectedRows: KpiBundle["collectedRows"] = [];
  const pendingRows: KpiBundle["pendingRows"] = [];
  for (const patient of patients) {
    for (const payment of patient.payments ?? []) {
      if (payment.status === "cobrado" && payment.paidAt && inside(payment.paidAt, start, end)) {
        collected += payment.amount;
        collectedRows.push({ name: patient.fullName, concept: payment.concept, amount: payment.amount });
      }
      if (payment.status === "pendiente" && inside(payment.dueAt, start, end)) {
        pending += payment.amount;
        pendingRows.push({ name: patient.fullName, concept: payment.concept, amount: payment.amount });
      }
    }
  }
  let booked = 0;
  let capacity = 0;
  const cursor = new Date(start);
  while (cursor < end && capacity < 1_000_000) {
    const day = occupancy(patients, catalog, cursor);
    booked += day.booked;
    capacity += day.capacity;
    cursor.setDate(cursor.getDate() + 1);
  }
  return {
    clients: [...clients.values()].sort((a, b) => b.visits - a.visits),
    absences: visits
      .filter((visit) => visit.status === "ausente" || visit.status === "cancelada")
      .map((visit) => ({ id: visit.id, name: visit.patientName, activity: visit.activityName, at: visit.at })),
    income,
    collected,
    pending,
    collectedRows,
    pendingRows,
    treatments: [...treatments.values()].sort((a, b) => b.income - a.income),
    cost,
    booked,
    capacity,
  };
}

export function previousRange(start: Date, end: Date) {
  const span = Math.max(end.getTime() - start.getTime(), 86_400_000);
  return { start: new Date(start.getTime() - span), end: new Date(start) };
}

export function trendPercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export function moneyShare(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}
