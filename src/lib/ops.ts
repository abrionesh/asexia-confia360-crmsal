import type {
  CashClose,
  ClinicCatalog,
  Patient,
  PayMethod,
  StockItem,
  TreatmentPack,
  TpvLine,
  Visit,
  WaitEntry,
} from "@/lib/api/types";
import { firstOpening } from "@/lib/schedule";

export const PAY_METHODS: PayMethod[] = ["efectivo", "tarjeta", "transferencia"];

export const METHOD_LABEL: Record<PayMethod, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};

export function dayKey(input: Date | string = new Date()) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function emptyMethods(): Record<PayMethod, number> {
  return { efectivo: 0, tarjeta: 0, transferencia: 0 };
}

export function isDayClosed(closes: CashClose[], day: string) {
  return closes.some((item) => item.day === day);
}

export function previstoByMethod(patients: Patient[], day: string) {
  const totals = emptyMethods();
  for (const patient of patients) {
    for (const payment of patient.payments ?? []) {
      if (payment.status !== "cobrado" || !payment.paidAt) continue;
      if (dayKey(payment.paidAt) !== day) continue;
      const method = payment.method ?? "efectivo";
      totals[method] += payment.amount;
    }
  }
  return totals;
}

export function tpvByMethod(lines: TpvLine[], day: string) {
  const totals = emptyMethods();
  for (const line of lines) {
    if (line.day !== day) continue;
    totals[line.method] += line.amount;
  }
  return totals;
}

export function defaultStock(): StockItem[] {
  return [
    {
      id: "stock-botox",
      name: "Vial de toxina",
      unit: "vial",
      quantity: 12,
      min: 4,
      activityId: "botox",
      perVisit: 1,
    },
    {
      id: "stock-canula",
      name: "Cánula facial",
      unit: "ud",
      quantity: 24,
      min: 8,
      activityId: "botox",
      perVisit: 1,
    },
    {
      id: "stock-suero",
      name: "Suero hidrafacial",
      unit: "ud",
      quantity: 10,
      min: 4,
      activityId: "hidrafacial",
      perVisit: 1,
    },
  ];
}

export function defaultPacks(): TreatmentPack[] {
  return [
    {
      id: "pack-hidra",
      name: "Hidrafacial × 4",
      summary: "Cuatro sesiones. Al marcar una como hecha queda citada la siguiente, 28 días después.",
      steps: [1, 2, 3, 4].map((session) => ({
        id: `hidra-${session}`,
        activityId: "hidrafacial",
        action: `Sesión ${session} de 4. Limpieza, extracción y suero.`,
        afterDays: 28,
      })),
    },
  ];
}

function refreshAppointment(patient: Patient) {
  const next = (patient.visits ?? [])
    .filter((visit) => visit.status === "programada")
    .map((visit) => visit.at)
    .sort()[0];
  patient.appointmentAt = next;
}

function nid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function applyReply(input: {
  patients: Patient[];
  waitlist: WaitEntry[];
  catalog: ClinicCatalog;
  patientId: string;
  answer: "confirmada" | "no-puede";
}) {
  const patients = structuredClone(input.patients);
  let waitlist = structuredClone(input.waitlist);
  const patient = patients.find((item) => item.id === input.patientId);
  if (!patient) return { patients, waitlist, message: "No encontramos la ficha." };
  const visit = [...(patient.visits ?? [])]
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .find((item) => item.status === "programada");
  if (!visit) return { patients, waitlist, message: "No hay una cita pendiente de confirmar." };

  if (input.answer === "confirmada") {
    visit.confirmation = "confirmada";
    if (patient.stage !== "lost" && patient.stage !== "invoiced") patient.stage = "confirmed";
    return { patients, waitlist, message: "Cita confirmada." };
  }

  visit.status = "cancelada";
  visit.confirmation = "no-puede";
  refreshAppointment(patient);
  const waiter = waitlist.find((item) => item.activityId === visit.activityId);
  if (!waiter) {
    return { patients, waitlist, message: "Cita soltada. Nadie esperaba ese tratamiento." };
  }
  const nextPatient = patients.find((item) => item.id === waiter.patientId);
  const activity = input.catalog.activities.find((item) => item.id === visit.activityId);
  if (!nextPatient || !activity) {
    return { patients, waitlist, message: "Cita soltada." };
  }
  const professional = nextPatient.assignedTo || visit.professional;
  const at = firstOpening(
    patients,
    input.catalog,
    new Date(visit.at),
    activity.durationMin,
    visit.roomId,
    professional,
  );
  if (!at) {
    return {
      patients,
      waitlist,
      message: "Cita soltada. El primero de la lista no cabe en ese hueco.",
    };
  }
  const room = input.catalog.rooms.find((item) => item.id === visit.roomId);
  nextPatient.visits = [
    ...(nextPatient.visits ?? []),
    {
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
      confirmation: "pendiente",
    },
  ];
  refreshAppointment(nextPatient);
  if (nextPatient.stage !== "lost") nextPatient.stage = "confirmed";
  waitlist = waitlist.filter((item) => item.id !== waiter.id);
  return { patients, waitlist, message: `Cita soltada. El hueco pasa a ${nextPatient.fullName}.` };
}

function openingSoon(
  patients: Patient[],
  catalog: ClinicCatalog,
  start: Date,
  durationMin: number,
  roomId: string,
  professional: string,
) {
  for (let offset = 0; offset < 21; offset += 1) {
    const day = new Date(start);
    day.setDate(day.getDate() + offset);
    const at = firstOpening(patients, catalog, day, durationMin, roomId, professional);
    if (at) return at;
  }
  return null;
}

export function applyVisitStatus(input: {
  patients: Patient[];
  waitlist: WaitEntry[];
  catalog: ClinicCatalog;
  stock: StockItem[];
  patientId: string;
  visitId: string;
  status: Visit["status"];
}) {
  const patients = structuredClone(input.patients);
  const stock = structuredClone(input.stock);
  let waitlist = structuredClone(input.waitlist);
  const patient = patients.find((item) => item.id === input.patientId);
  const visit = patient?.visits?.find((item) => item.id === input.visitId);
  if (!patient || !visit) return { patients, waitlist, stock, note: "" };

  const wasDone = visit.status === "realizada";
  visit.status = input.status;
  if (input.status === "cancelada") visit.confirmation = "no-puede";
  refreshAppointment(patient);
  if (input.status !== "realizada" || wasDone) {
    return { patients, waitlist, stock, note: "" };
  }

  if (!visit.stockApplied) {
    for (const item of stock) {
      if (!item.activityId || item.activityId !== visit.activityId || item.perVisit <= 0) continue;
      item.quantity = Math.max(0, item.quantity - item.perVisit);
    }
    visit.stockApplied = true;
  }

  let note = "";
  for (const plan of patient.plans ?? []) {
    const index = plan.steps.findIndex(
      (step) => step.status === "pendiente" && step.activityId === visit.activityId && !step.visitId,
    );
    if (index < 0) continue;
    plan.steps[index] = { ...plan.steps[index], status: "hecha", visitId: visit.id };
    const next = plan.steps[index + 1];
    if (!next || next.status === "hecha") break;
    const already = (patient.visits ?? []).some(
      (item) => item.status === "programada" && item.activityId === next.activityId,
    );
    if (already) {
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
      waitlist = [
        {
          id: nid("wait"),
          patientId: patient.id,
          patientName: patient.fullName,
          activityId: activity.id,
          activityName: activity.name,
          createdAt: new Date().toISOString(),
        },
        ...waitlist,
      ];
      note = "Sesión hecha. No había hueco: queda en lista de espera.";
      break;
    }
    const room = input.catalog.rooms.find((item) => item.id === visit.roomId);
    patient.visits = [
      ...(patient.visits ?? []),
      {
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
        confirmation: "pendiente",
      },
    ];
    refreshAppointment(patient);
    note = "Sesión hecha. La siguiente queda programada.";
    break;
  }

  return { patients, waitlist, stock, note };
}
