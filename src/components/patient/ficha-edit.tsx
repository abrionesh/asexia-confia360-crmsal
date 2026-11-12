import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { Patient } from "@/lib/api";
import type { LeadSource } from "@/lib/api/types";

export interface FichaDraft {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  birthday: string;
  source: LeadSource;
  treatmentInterest: string;
  assignedTo: string;
  estimatedValue: string;
  notes: string;
  contraindications: string;
  visitPrices: Record<string, string>;
  paymentAmounts: Record<string, string>;
}

const FichaEditContext = createContext<{
  draft: FichaDraft;
  setDraft: Dispatch<SetStateAction<FichaDraft>>;
} | null>(null);

export function FichaEditProvider({
  draft,
  setDraft,
  children,
}: {
  draft: FichaDraft;
  setDraft: Dispatch<SetStateAction<FichaDraft>>;
  children: ReactNode;
}) {
  return <FichaEditContext.Provider value={{ draft, setDraft }}>{children}</FichaEditContext.Provider>;
}

export function useFichaDraft() {
  return useContext(FichaEditContext);
}

export function draftFrom(patient: Patient): FichaDraft {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    city: patient.city,
    birthday: patient.birthday?.slice(0, 10) ?? "",
    source: patient.source,
    treatmentInterest: patient.treatmentInterest,
    assignedTo: patient.assignedTo,
    estimatedValue: String(patient.estimatedValue),
    notes: patient.notes,
    contraindications: patient.contraindications ?? "",
    visitPrices: Object.fromEntries((patient.visits ?? []).map((visit) => [visit.id, String(visit.price)])),
    paymentAmounts: Object.fromEntries((patient.payments ?? []).map((payment) => [payment.id, String(payment.amount)])),
  };
}

function asNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function previewPatient(patient: Patient, draft: FichaDraft): Patient {
  const estimatedValue = asNumber(draft.estimatedValue, patient.estimatedValue);
  return {
    ...patient,
    estimatedValue,
    ledgerTotal: estimatedValue,
    payments: (patient.payments ?? []).map((payment) =>
      payment.status === "pendiente"
        ? { ...payment, amount: asNumber(draft.paymentAmounts[payment.id] ?? "", payment.amount) }
        : payment,
    ),
    visits: (patient.visits ?? []).map((visit) => ({
      ...visit,
      price: asNumber(draft.visitPrices[visit.id] ?? "", visit.price),
    })),
  };
}
