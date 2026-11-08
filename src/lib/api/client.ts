/**
 * Presentation-layer data access.
 *
 * Today this module talks to in-memory mock data (with simulated latency)
 * so every view can show skeleton states. Replace `createMockClient()` with
 * a REST or Odoo XML-RPC adapter that satisfies `AsexiAApi` — no UI changes.
 *
 * REST sketch:
 *   GET    /pipeline
 *   GET    /patients/:id
 *   GET    /patients/:id/timeline
 *   PATCH  /patients/:id  { stage }
 *   POST   /copilot/ask   { prompt }
 *
 * XML-RPC sketch (Odoo):
 *   execute_kw(db, uid, key, "asexia.lead", "search_read", [...])
 */

import type {
  Alarm,
  AsexiAApi,
  ClinicCatalog,
  ClinicFile,
  ContactLog,
  CopilotMessage,
  FileTarget,
  ManualAlarmInput,
  Patient,
  PaymentInput,
  PipelineMetrics,
  PipelineStage,
  TimelineEvent,
  VisitInput,
} from "./types";
import { PIPELINE_STAGES } from "./types";
import { buildAlarms } from "./mock/alarms";
import { copilotReply } from "./mock/copilot";
import { wait } from "./mock/clock";
import { seedPatients } from "./mock/patients";
import { seedTimelines } from "./mock/timeline";
import { attachClinic, seedCatalog } from "./mock/clinic";
import { normalizeCatalog } from "../catalog";
import { isOffline, readSnapshot, writeSnapshot, type OutboxItem } from "./persist";

const restored = typeof window !== "undefined" ? readSnapshot() : null;
let patients: Patient[] = restored?.patients?.length
  ? restored.patients
  : attachClinic(seedPatients.map((patient) => ({ ...patient })));
let outbox: OutboxItem[] = restored?.outbox ?? [];
let resolvedAlarms: Record<string, "sent" | "dismissed"> = restored?.resolvedAlarms ?? {};
let catalog: ClinicCatalog = normalizeCatalog(restored?.catalog ?? seedCatalog());
const timelines: Record<string, TimelineEvent[]> = restored?.timelines
  ? restored.timelines
  : Object.fromEntries(
      Object.entries(seedTimelines).map(([id, events]) => [
        id,
        events.map((event) => ({ ...event })),
      ]),
    );

function persist() {
  writeSnapshot({ patients, outbox, resolvedAlarms, timelines, catalog });
}

function queueMove(id: string, stage: PipelineStage) {
  outbox = [
    ...outbox.filter((item) => item.patientId !== id),
    {
      id: `mv-${id}-${Date.now()}`,
      kind: "move",
      patientId: id,
      stage,
      at: new Date().toISOString(),
    },
  ];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function computeMetrics(list: Patient[]): PipelineMetrics {
  const closed = list.filter((patient) => patient.stage === "invoiced" || patient.billed);
  const open = list.filter(
    (patient) => patient.stage !== "invoiced" && patient.stage !== "lost" && !patient.billed,
  );
  const pipelineValue = open.reduce((sum, patient) => sum + patient.estimatedValue, 0);
  const closedValue = closed.reduce((sum, patient) => sum + patient.estimatedValue, 0);
  const conversionRate = list.length === 0 ? 0 : Math.round((closed.length / list.length) * 100);
  return {
    leadCount: list.length,
    pipelineValue,
    conversionRate,
    appointmentsThisWeek: list.filter((patient) => patient.stage === "confirmed").length,
    averageTicket: closed.length === 0 ? 0 : Math.round(closedValue / closed.length),
  };
}

function withResolution(alarms: Alarm[]): Alarm[] {
  return alarms.map((alarm) => {
    const status = resolvedAlarms[alarm.id];
    return status ? { ...alarm, status } : alarm;
  });
}

const QUEUE_WINDOW = 24 * 3_600_000;
const BIRTHDAY_WINDOW = 7 * 24 * 3_600_000;

function pushEvent(
  patientId: string,
  event: Pick<TimelineEvent, "channel" | "direction" | "title" | "body">,
) {
  const entry: TimelineEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    patientId,
    at: new Date().toISOString(),
    ...event,
  };
  timelines[patientId] = [entry, ...(timelines[patientId] ?? [])];
}

function patchPatient(id: string, recipe: (patient: Patient) => Patient) {
  const current = patients.find((patient) => patient.id === id);
  if (!current) return null;
  const next = recipe({ ...current, lastActivityAt: new Date().toISOString() });
  patients = patients.map((patient) => (patient.id === id ? next : patient));
  persist();
  return next;
}

function createMockClient(): AsexiAApi {
  return {
    async listPipeline() {
      if (isOffline()) return clone(patients);
      await wait(720);
      persist();
      return clone(patients);
    },
    async getPatient(id) {
      if (!isOffline()) await wait(640);
      return clone(patients.find((patient) => patient.id === id) ?? null);
    },
    async listTimeline(patientId) {
      if (!isOffline()) await wait(680);
      return clone(timelines[patientId] ?? []);
    },
    async movePatient(id, stage) {
      if (!isOffline()) await wait(220);
      patients = patients.map((patient) =>
        patient.id === id
          ? {
              ...patient,
              stage,
              lastActivityAt: new Date().toISOString(),
            }
          : patient,
      );
      const updated = patients.find((patient) => patient.id === id);
      if (!updated) {
        throw new Error(`Paciente no encontrado: ${id}`);
      }
      if (isOffline()) queueMove(id, stage);
      else outbox = outbox.filter((item) => item.patientId !== id);
      persist();
      return clone(updated);
    },
    async getMetrics() {
      if (!isOffline()) await wait(560);
      return computeMetrics(patients);
    },
    async askCopilot(prompt, currentPatients) {
      if (!isOffline()) await wait(520);
      return copilotReply(prompt, currentPatients);
    },
    async listAlarms() {
      if (!isOffline()) await wait(480);
      const now = Date.now();
      return clone(
        withResolution(buildAlarms(patients, now))
          .filter(
            (alarm) =>
              alarm.status !== "sent" &&
              alarm.status !== "dismissed" &&
              new Date(alarm.dueAt).getTime() <=
                now + (alarm.kind === "birthday" ? BIRTHDAY_WINDOW : QUEUE_WINDOW),
          )
          .sort((a, b) => Number(a.status !== "due") - Number(b.status !== "due")),
      );
    },
    async listOpenAlarms() {
      if (!isOffline()) await wait(360);
      return clone(
        withResolution(buildAlarms(patients))
          .filter((alarm) => alarm.status !== "sent" && alarm.status !== "dismissed")
          .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
      );
    },
    async listPatientAlarms(patientId) {
      if (!isOffline()) await wait(420);
      return clone(
        withResolution(buildAlarms(patients.filter((patient) => patient.id === patientId))).filter(
          (alarm) => alarm.status !== "dismissed",
        ),
      );
    },
    async resolveAlarm(id, status) {
      if (!isOffline()) await wait(180);
      const alarm = withResolution(buildAlarms(patients)).find((item) => item.id === id);
      if (!alarm) return null;
      resolvedAlarms = { ...resolvedAlarms, [id]: status };
      if (status === "sent") {
        const title =
          alarm.channel === "internal"
            ? "Llamada registrada"
            : alarm.channel === "email"
              ? "Correo preparado"
              : "WhatsApp preparado";
        const event: TimelineEvent = {
          id: `alarm-${id}-${Date.now()}`,
          patientId: alarm.patientId,
          channel: alarm.channel === "whatsapp" ? "whatsapp" : alarm.channel === "email" ? "email" : "system",
          direction: "outbound",
          at: new Date().toISOString(),
          title,
          body: alarm.draft,
        };
        timelines[alarm.patientId] = [event, ...(timelines[alarm.patientId] ?? [])];
      }
      persist();
      return clone({ ...alarm, status });
    },
    async getCatalog() {
      if (!isOffline()) await wait(280);
      return clone(normalizeCatalog(catalog));
    },
    async saveCatalog(next) {
      if (!isOffline()) await wait(220);
      catalog = normalizeCatalog(next);
      persist();
      return clone(catalog);
    },
    async logContact(patientId, entry: ContactLog) {
      if (!isOffline()) await wait(180);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const title =
        entry.channel === "whatsapp"
          ? "WhatsApp enviado"
          : entry.channel === "email"
            ? "Correo enviado"
            : "Nota de ficha";
      pushEvent(patientId, {
        channel: entry.channel,
        direction: entry.channel === "system" ? "internal" : "outbound",
        title,
        body: entry.body.trim(),
      });
      return clone(patchPatient(patientId, (current) => current));
    },
    async addVisit(patientId, input: VisitInput) {
      if (!isOffline()) await wait(220);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const surgical =
        input.roomId === "quirofano" || input.activityId === "rino" || input.activityId === "blefaro";
      if (surgical && !patient.consentSigned) {
        throw new Error("consent");
      }
      const activity = catalog.activities.find((item) => item.id === input.activityId);
      const room = catalog.rooms.find((item) => item.id === input.roomId);
      const visit = {
        id: `visit-${Date.now()}`,
        at: input.at,
        activityId: input.activityId,
        activityName: activity?.name ?? "Actividad",
        roomId: input.roomId,
        roomName: room?.name ?? "Sala",
        durationMin: activity?.durationMin ?? 30,
        professional: input.professional || patient.assignedTo,
        status: "programada" as const,
        notes: input.notes.trim(),
        price: activity?.price ?? 0,
      };
      const when = new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(input.at));
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Cita programada",
        body: `${visit.activityName} · ${visit.roomName} · ${when} · ${visit.durationMin} min · ${visit.professional}. ${visit.notes}`.trim(),
      });
      return clone(
        patchPatient(patientId, (current) => {
          const visits = [...(current.visits ?? []), visit];
          const nextAt = visits
            .filter((item) => item.status === "programada")
            .map((item) => item.at)
            .sort()[0];
          return { ...current, visits, appointmentAt: nextAt ?? current.appointmentAt };
        }),
      );
    },
    async addPayment(patientId, input: PaymentInput) {
      if (!isOffline()) await wait(180);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const payment = {
        id: `pay-${Date.now()}`,
        dueAt: input.dueAt,
        amount: input.amount,
        concept: input.concept.trim(),
        status: input.status,
      };
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: input.status === "cobrado" ? "Cobro registrado" : "Pago planificado",
        body: `${payment.concept} · ${payment.amount} € · ${input.status}.`,
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          payments: [...(current.payments ?? []), payment],
          billed:
            input.status === "cobrado" &&
            (current.payments ?? [])
              .filter((item) => item.status === "cobrado")
              .reduce((sum, item) => sum + item.amount, 0) +
              input.amount >=
              (current.ledgerTotal ?? current.estimatedValue),
        })),
      );
    },
    async addPending(patientId, title: string) {
      if (!isOffline()) await wait(120);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const task = {
        id: `todo-${Date.now()}`,
        title: title.trim(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Pendiente añadido",
        body: task.title,
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          pendings: [...(current.pendings ?? []), task],
        })),
      );
    },
    async togglePending(patientId, pendingId: string) {
      if (!isOffline()) await wait(80);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const task = (patient.pendings ?? []).find((item) => item.id === pendingId);
      if (!task) return null;
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: task.done ? "Pendiente reabierto" : "Pendiente cerrado",
        body: task.title,
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          pendings: (current.pendings ?? []).map((item) =>
            item.id === pendingId ? { ...item, done: !item.done } : item,
          ),
        })),
      );
    },
    async addManualAlarm(patientId, input: ManualAlarmInput) {
      if (!isOffline()) await wait(160);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const alarm = {
        id: `ma-${Date.now()}`,
        title: input.title.trim(),
        dueAt: input.dueAt,
        channel: input.channel,
        draft: input.draft.trim(),
      };
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Alarma creada",
        body: `${alarm.title}. ${alarm.draft}`,
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          manualAlarms: [...(current.manualAlarms ?? []), alarm],
        })),
      );
    },
    async signConsent(patientId) {
      if (!isOffline()) await wait(120);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Consentimiento firmado",
        body: "El paciente firma el consentimiento informado.",
      });
      return clone(patchPatient(patientId, (current) => ({ ...current, consentSigned: true })));
    },
    async setContraindications(patientId, text) {
      if (!isOffline()) await wait(80);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Contraindicaciones",
        body: text.trim() || "Sin contraindicaciones.",
      });
      return clone(
        patchPatient(patientId, (current) => ({ ...current, contraindications: text.trim() })),
      );
    },
    async markLost(patientId, reason) {
      if (!isOffline()) await wait(140);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Dado por perdido",
        body: reason.trim(),
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          stage: "lost",
          lostReason: reason.trim(),
        })),
      );
    },
    async recordSatisfaction(patientId, score) {
      if (!isOffline()) await wait(100);
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const label = score === "bien" ? "Bien" : score === "regular" ? "Regular" : "Mal";
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Seguimiento 48 h",
        body: label,
      });
      return clone(patchPatient(patientId, (current) => ({ ...current, satisfaction: score })));
    },
    async collectPayment(patientId, paymentId) {
      if (!isOffline()) await wait(140);
      const patient = patients.find((item) => item.id === patientId);
      const payment = patient?.payments?.find((item) => item.id === paymentId);
      if (!patient || !payment) return null;
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Cobro en caja",
        body: `${payment.concept} · ${payment.amount} €`,
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          payments: (current.payments ?? []).map((item) =>
            item.id === paymentId
              ? { ...item, status: "cobrado" as const, paidAt: new Date().toISOString() }
              : item,
          ),
        })),
      );
    },
    async attachFile(target: FileTarget, input: Omit<ClinicFile, "id" | "addedAt">) {
      if (!isOffline()) await wait(160);
      const file: ClinicFile = {
        id: `file-${Date.now()}`,
        addedAt: new Date().toISOString(),
        ...input,
      };
      if (target.kind === "patient" || target.kind === "visit") {
        const patient = patients.find((item) => item.id === target.patientId);
        if (!patient) return null;
        if (target.kind === "visit" && !(patient.visits ?? []).some((visit) => visit.id === target.visitId)) {
          return null;
        }
        pushEvent(target.patientId, {
          channel: "system",
          direction: "internal",
          title: "Documento",
          body: input.name,
        });
        patchPatient(target.patientId, (current) => {
          if (target.kind === "patient") return { ...current, files: [file, ...(current.files ?? [])] };
          return {
            ...current,
            visits: (current.visits ?? []).map((visit) =>
              visit.id === target.visitId ? { ...visit, files: [file, ...(visit.files ?? [])] } : visit,
            ),
          };
        });
        return clone(file);
      }
      if (target.kind === "professional") {
        if (!catalog.professionals.some((item) => item.id === target.professionalId)) return null;
        catalog = normalizeCatalog({
          ...catalog,
          professionals: catalog.professionals.map((item) =>
            item.id === target.professionalId ? { ...item, files: [file, ...(item.files ?? [])] } : item,
          ),
        });
      } else {
        if (!catalog.activities.some((item) => item.id === target.activityId)) return null;
        catalog = normalizeCatalog({
          ...catalog,
          activities: catalog.activities.map((item) =>
            item.id === target.activityId ? { ...item, files: [file, ...(item.files ?? [])] } : item,
          ),
        });
      }
      persist();
      return clone(file);
    },
    async removeFile(target: FileTarget, fileId: string) {
      if (!isOffline()) await wait(120);
      if (target.kind === "patient" || target.kind === "visit") {
        const patient = patients.find((item) => item.id === target.patientId);
        if (!patient) return false;
        patchPatient(target.patientId, (current) => {
          if (target.kind === "patient") {
            return { ...current, files: (current.files ?? []).filter((file) => file.id !== fileId) };
          }
          return {
            ...current,
            visits: (current.visits ?? []).map((visit) =>
              visit.id === target.visitId
                ? { ...visit, files: (visit.files ?? []).filter((file) => file.id !== fileId) }
                : visit,
            ),
          };
        });
        return true;
      }
      if (target.kind === "professional") {
        catalog = normalizeCatalog({
          ...catalog,
          professionals: catalog.professionals.map((item) =>
            item.id === target.professionalId
              ? { ...item, files: (item.files ?? []).filter((file) => file.id !== fileId) }
              : item,
          ),
        });
      } else {
        catalog = normalizeCatalog({
          ...catalog,
          activities: catalog.activities.map((item) =>
            item.id === target.activityId
              ? { ...item, files: (item.files ?? []).filter((file) => file.id !== fileId) }
              : item,
          ),
        });
      }
      persist();
      return true;
    },
  };
}

export const api: AsexiAApi = createMockClient();

export function pendingMoves() {
  return outbox.length;
}

export function flushOutbox() {
  const count = outbox.length;
  outbox = [];
  persist();
  return count;
}

export const COPILOT_SUGGESTIONS = [
  "Resumen del pipeline",
  "Leads sin respuesta",
  "Briefing de Elena Ruiz",
  "Previsión de facturación",
  "Redactar WhatsApp",
] as const;

export { PIPELINE_STAGES };
export type { CopilotMessage, Patient, PipelineMetrics, PipelineStage, TimelineEvent };
