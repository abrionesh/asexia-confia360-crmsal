import type { Patient } from "@/lib/api/types";
import { sameDay } from "@/lib/occupancy";

export function cashDay(patients: Patient[], day: Date) {
  let collected = 0;
  let expected = 0;
  for (const patient of patients) {
    for (const payment of patient.payments ?? []) {
      if (payment.status === "cobrado" && payment.paidAt && sameDay(payment.paidAt, day)) {
        collected += payment.amount;
      }
      if (payment.status === "pendiente" && sameDay(payment.dueAt, day)) {
        expected += payment.amount;
      }
    }
  }
  return { collected, expected };
}
