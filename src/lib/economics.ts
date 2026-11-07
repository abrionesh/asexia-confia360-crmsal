import type { Patient } from "@/lib/api/types";

export function economics(patient: Patient) {
  const payments = patient.payments ?? [];
  if (payments.length === 0) {
    const total = patient.ledgerTotal ?? patient.estimatedValue;
    const collected = patient.billed || patient.stage === "invoiced" ? total : 0;
    return { total, collected, pending: Math.max(0, total - collected) };
  }
  const collected = payments
    .filter((payment) => payment.status === "cobrado")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const scheduled = payments
    .filter((payment) => payment.status === "pendiente")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const total = Math.max(patient.ledgerTotal ?? patient.estimatedValue, collected + scheduled);
  return { total, collected, pending: Math.max(0, total - collected) };
}

export function nextBirthday(iso: string, now = new Date()) {
  const [, month, day] = iso.split("-").map(Number);
  if (!month || !day) return null;
  const thisYear = new Date(now.getFullYear(), month - 1, day);
  if (thisYear.getTime() + 86_400_000 < now.getTime()) {
    thisYear.setFullYear(now.getFullYear() + 1);
  }
  return thisYear;
}

export function ageFrom(iso: string, now = new Date()) {
  const born = new Date(iso);
  let age = now.getFullYear() - born.getFullYear();
  const before =
    now.getMonth() < born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() < born.getDate());
  if (before) age -= 1;
  return age;
}
