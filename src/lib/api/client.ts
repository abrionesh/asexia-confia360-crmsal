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
  AdmitInput,
  FichaPatch,
  Invoice,
  WaitEntry,
  PayMethod,
  StockItem,
  TreatmentPack,
  TpvLine,
  CashClose,
} from "./types";
import { PIPELINE_STAGES } from "./types";
import { buildAlarms } from "./mock/alarms";
import { copilotReply } from "./mock/copilot";
import { wait } from "./mock/clock";
import { seedPatients } from "./mock/patients";
import { seedTimelines } from "./mock/timeline";
import { attachClinic, seedCatalog } from "./mock/clinic";
import { normalizeCatalog } from "../catalog";
import { isOffline, readSnapshot, writeSnapshot, type OutboxItem, type Snapshot } from "./persist";
import { scheduleProblem, firstOpening } from "../schedule";
import { applyReply, applyVisitStatus, dayKey, defaultPacks, defaultStock, isDayClosed, previstoByMethod, tpvByMethod } from "../ops";

const restored = typeof window !== "undefined" ? readSnapshot() : null;
let patients: Patient[] = restored?.patients?.length
  ? restored.patients
  : attachClinic(seedPatients.map((patient) => ({ ...patient })));
let outbox: OutboxItem[] = restored?.outbox ?? [];
let resolvedAlarms: Record<string, "sent" | "dismissed"> = restored?.resolvedAlarms ?? {};
let catalog: ClinicCatalog = normalizeCatalog(restored?.catalog ?? seedCatalog());
let waitlist: WaitEntry[] = restored?.waitlist ?? [];
let dismissedPredictions: string[] = restored?.dismissedPredictions ?? [];
let invoices: Invoice[] = restored?.invoices ?? [];
let invoiceSeq = restored?.invoiceSeq ?? 0;
let stock: StockItem[] = restored?.stock ?? defaultStock();
let packs: TreatmentPack[] = restored?.packs ?? defaultPacks();
let tpv: TpvLine[] = restored?.tpv ?? [];
let closes: CashClose[] = restored?.closes ?? [];
let revision = restored?.revision ?? 0;
const timelines: Record<string, TimelineEvent[]> = restored?.timelines
  ? restored.timelines
  : Object.fromEntries(
      Object.entries(seedTimelines).map(([id, events]) => [
        id,
        events.map((event) => ({ ...event })),
      ]),
    );

function snapshotNow(): Snapshot {
  return {
    revision,
    patients,
    outbox,
    resolvedAlarms,
    timelines,
    catalog,
    waitlist,
    dismissedPredictions,
    invoices,
    invoiceSeq,
    stock,
    packs,
    tpv,
    closes,
  };
}

function persist() {
  revision += 1;
  const snap = snapshotNow();
  writeSnapshot(snap);
  if (typeof window === "undefined") return;
  void import("./sync").then((mod) => mod.publishSnapshot(snap));
}

export function applySnapshot(next: Snapshot) {
  patients = next.patients?.length ? next.patients : patients;
  outbox = next.outbox ?? [];
  resolvedAlarms = next.resolvedAlarms ?? {};
  catalog = normalizeCatalog(next.catalog ?? catalog);
  waitlist = next.waitlist ?? [];
  dismissedPredictions = next.dismissedPredictions ?? [];
  invoices = next.invoices ?? [];
  invoiceSeq = next.invoiceSeq ?? invoiceSeq;
  stock = next.stock ?? stock;
  packs = next.packs ?? packs;
  tpv = next.tpv ?? tpv;
  closes = next.closes ?? closes;
  revision = next.revision ?? revision;
  if (next.timelines) {
    for (const key of Object.keys(timelines)) delete timelines[key];
    Object.assign(timelines, next.timelines);
  }
  writeSnapshot(snapshotNow());
}

export function localRevision() {
  return revision;
}

export function currentSnapshot() {
  return snapshotNow();
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
  event: Pick<TimelineEvent, "channel" | "direction" | "title" | "body" | "delivery">,
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

function bookVisit(patientId: string, input: VisitInput) {
  const patient = patients.find((item) => item.id === patientId);
  if (!patient) return null;
  const surgical =
    input.roomId === "quirofano" || input.activityId === "rino" || input.activityId === "blefaro";
  if (surgical && !patient.consentSigned) {
    throw new Error("consent");
  }
  const activity = catalog.activities.find((item) => item.id === input.activityId);
  const room = catalog.rooms.find((item) => item.id === input.roomId);
  const professional = input.professional || patient.assignedTo;
  const problem = scheduleProblem(patients, catalog, {
    at: input.at,
    durationMin: activity?.durationMin ?? 30,
    roomId: input.roomId,
    professional,
  });
  if (problem) throw new Error(`agenda: ${problem}`);
  const visit = {
    id: `visit-${Date.now()}`,
    at: input.at,
    activityId: input.activityId,
    activityName: activity?.name ?? "Actividad",
    roomId: input.roomId,
    roomName: room?.name ?? "Sala",
    durationMin: activity?.durationMin ?? 30,
    professional,
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
  return patchPatient(patientId, (current) => {
    const visits = [...(current.visits ?? []), visit];
    const nextAt = visits
      .filter((item) => item.status === "programada")
      .map((item) => item.at)
      .sort()[0];
    return { ...current, visits, appointmentAt: nextAt ?? current.appointmentAt };
  });
}

function digitsOf(value: string) {
  return value.replace(/\D/g, "");
}

function findByContact(phone: string, email: string) {
  const tail = digitsOf(phone).slice(-9);
  if (tail.length >= 9) {
    const byPhone = patients.find((patient) => digitsOf(patient.phone).endsWith(tail));
    if (byPhone) return byPhone;
  }
  const mail = email.trim().toLowerCase();
  if (!mail) return undefined;
  return patients.find((patient) => patient.email.trim().toLowerCase() === mail);
}

function portalToken() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function createMockClient(): AsexiAApi {
  return {
    async listPipeline() {
      if (isOffline()) return clone(patients);
      await wait(720);
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
        withResolution(buildAlarms(patients, now, catalog))
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
        withResolution(buildAlarms(patients, Date.now(), catalog))
          .filter((alarm) => alarm.status !== "sent" && alarm.status !== "dismissed")
          .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
      );
    },
    async listPatientAlarms(patientId) {
      if (!isOffline()) await wait(420);
      return clone(
        withResolution(buildAlarms(patients.filter((patient) => patient.id === patientId), Date.now(), catalog)).filter(
          (alarm) => alarm.status !== "dismissed",
        ),
      );
    },
    async resolveAlarm(id, status) {
      if (!isOffline()) await wait(180);
      const alarm = withResolution(buildAlarms(patients, Date.now(), catalog)).find((item) => item.id === id);
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
          ? "WhatsApp"
          : entry.channel === "email"
            ? "Correo"
            : "Nota de ficha";
      pushEvent(patientId, {
        channel: entry.channel,
        direction: entry.channel === "system" ? "internal" : "outbound",
        title,
        body: entry.body.trim(),
        delivery: entry.channel === "system" ? undefined : "preparado",
      });
      return clone(patchPatient(patientId, (current) => current));
    },
    async addVisit(patientId, input: VisitInput) {
      if (!isOffline()) await wait(220);
      const updated = bookVisit(patientId, input);
      return updated ? clone(updated) : null;
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
    async collectPayment(patientId, paymentId, method: PayMethod) {
      if (!isOffline()) await wait(140);
      if (isDayClosed(closes, dayKey(new Date()))) {
        throw new Error("caja: El día está cerrado. El total no se toca.");
      }
      const patient = patients.find((item) => item.id === patientId);
      const payment = patient?.payments?.find((item) => item.id === paymentId);
      if (!patient || !payment) return null;
      const label = method === "tarjeta" ? "tarjeta" : method === "transferencia" ? "transferencia" : "efectivo";
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Cobro en caja",
        body: `${payment.concept} · ${payment.amount} € · ${label}`,
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          payments: (current.payments ?? []).map((item) =>
            item.id === paymentId
              ? { ...item, status: "cobrado" as const, paidAt: new Date().toISOString(), method }
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
    async dismissPrediction(id: string) {
      dismissedPredictions = [...new Set([...dismissedPredictions, id])];
      persist();
      return [...dismissedPredictions];
    },
    async listDismissed() {
      return [...dismissedPredictions];
    },
    async listWait() {
      return clone(waitlist);
    },
    async addWait(patientId: string, activityId: string) {
      const patient = patients.find((item) => item.id === patientId);
      const activity = catalog.activities.find((item) => item.id === activityId);
      if (!patient || !activity) return null;
      const entry: WaitEntry = {
        id: `wait-${Date.now()}`,
        patientId,
        patientName: patient.fullName,
        activityId,
        activityName: activity.name,
        createdAt: new Date().toISOString(),
      };
      waitlist = [entry, ...waitlist];
      persist();
      return clone(entry);
    },
    async removeWait(id: string) {
      waitlist = waitlist.filter((item) => item.id !== id);
      persist();
      return true;
    },
    async placeWait(id: string, roomId: string, day: string) {
      const entry = waitlist.find((item) => item.id === id);
      if (!entry) return null;
      const patient = patients.find((item) => item.id === entry.patientId);
      const activity = catalog.activities.find((item) => item.id === entry.activityId);
      if (!patient || !activity) return null;
      const at = firstOpening(patients, catalog, new Date(day), activity.durationMin, roomId, patient.assignedTo);
      if (!at) throw new Error("agenda: No hay hueco ese día para esta duración.");
      const saved = await this.addVisit(entry.patientId, {
        at,
        activityId: entry.activityId,
        roomId,
        professional: patient.assignedTo,
        notes: "Desde la lista de espera.",
      });
      if (!saved) return null;
      waitlist = waitlist.filter((item) => item.id !== id);
      persist();
      return saved;
    },
    async markDelivery(patientId, eventId, delivery: "enviado" | "fallido") {
      const list = timelines[patientId];
      if (!list?.some((event) => event.id === eventId)) return false;
      timelines[patientId] = list.map((event) => (event.id === eventId ? { ...event, delivery } : event));
      persist();
      return true;
    },
    async issueInvoice(patientId, paymentId, vatRate: number) {
      const patient = patients.find((item) => item.id === patientId);
      const payment = patient?.payments?.find((item) => item.id === paymentId && item.status === "cobrado");
      if (!patient || !payment) return null;
      const existing = invoices.find((item) => item.paymentId === paymentId);
      if (existing) return clone(existing);
      invoiceSeq += 1;
      const year = new Date().getFullYear();
      const total = payment.amount;
      const rate = vatRate > 0 ? vatRate : 0;
      const base = rate ? Math.round((total / (1 + rate / 100)) * 100) / 100 : total;
      const invoice: Invoice = {
        id: `inv-${invoiceSeq}`,
        number: `ASE-${year}-${String(invoiceSeq).padStart(4, "0")}`,
        at: new Date().toISOString(),
        patientId,
        patientName: patient.fullName,
        concept: payment.concept,
        base,
        vatRate: rate,
        vat: Math.round((total - base) * 100) / 100,
        total,
        paymentId,
      };
      invoices = [invoice, ...invoices];
      pushEvent(patientId, { channel: "system", direction: "internal", title: `Factura ${invoice.number}`, body: payment.concept });
      persist();
      return clone(invoice);
    },
    async listInvoices() {
      return clone(invoices);
    },
    async admitPatient(input: AdmitInput) {
      if (!isOffline()) await wait(220);
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const phone = input.phone.trim();
      const email = input.email.trim().toLowerCase();
      if (!firstName) throw new Error("Escriba el nombre.");
      if (digitsOf(phone).length < 9 && !email) throw new Error("Indique un teléfono o un correo.");
      const interest = catalog.activities.find((item) => item.id === input.interest);
      const existing = findByContact(phone, email);
      let created = false;
      let id = existing?.id ?? "";
      if (existing) {
        patchPatient(existing.id, (current) => ({
          ...current,
          phone: current.phone.trim() || phone,
          email: current.email.trim() || email,
          treatmentInterest: current.treatmentInterest || interest?.name || input.interest.trim() || current.treatmentInterest,
          estimatedValue: current.estimatedValue || interest?.price || current.estimatedValue,
          tags: current.tags.includes(input.kind) ? current.tags : [...current.tags, input.kind],
        }));
        pushEvent(existing.id, {
          channel: "system",
          direction: "internal",
          title: "Ficha ya existente",
          body: `Recepción retomó el alta. Origen ${input.source}. No se duplica.`,
        });
        persist();
      } else {
        created = true;
        id = `p-${Date.now()}`;
        const professional = input.visit?.professional || catalog.professionals[0]?.name || "Recepción";
        const patient: Patient = {
          id,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          phone,
          email,
          city: "",
          clinic: patients[0]?.clinic || "Clínica",
          treatmentInterest: interest?.name || "Por concretar",
          estimatedValue: interest?.price ?? 0,
          source: input.source,
          stage: "new",
          assignedTo: professional,
          lastActivityAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          tags: [input.kind],
          notes: "",
          preferredChannel: phone ? "whatsapp" : "email",
          visits: [],
          payments: [],
        };
        patients = [patient, ...patients];
        timelines[id] = [];
        pushEvent(id, {
          channel: "system",
          direction: "internal",
          title: "Alta",
          body: `${input.kind === "posible" ? "Posible cliente" : "Cliente"} · ${input.source}`,
        });
        persist();
      }
      if (input.visit?.at) {
        const booked = bookVisit(id, { ...input.visit, notes: input.visit.notes || "Alta de recepción" });
        if (booked && (booked.stage === "new" || booked.stage === "lost")) {
          patchPatient(id, (current) => ({ ...current, stage: "confirmed" }));
        }
      }
      const patient = patients.find((item) => item.id === id);
      if (!patient) throw new Error("No se pudo guardar la ficha.");
      return clone({ patient, created });
    },
    async updatePatient(id, input) {
      if (!isOffline()) await wait(180);
      const current = patients.find((item) => item.id === id);
      if (!current) throw new Error("No encontramos la ficha.");
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const phone = input.phone.trim();
      const email = input.email.trim().toLowerCase();
      if (!firstName) throw new Error("Escriba el nombre.");
      if (digitsOf(phone).length < 9 && !email) throw new Error("Indique un teléfono o un correo.");
      const tail = digitsOf(phone).slice(-9);
      const clash = patients.find((item) => {
        if (item.id === id) return false;
        if (tail.length >= 9 && digitsOf(item.phone).endsWith(tail)) return true;
        return Boolean(email) && item.email.trim().toLowerCase() === email;
      });
      if (clash) throw new Error(`Ese teléfono o correo ya está en la ficha de ${clash.fullName}.`);
      const interest = catalog.activities.find((item) => item.id === input.interest);
      const previous = catalog.activities.find((item) => item.name === current.treatmentInterest);
      const updated = patchPatient(id, (patient) => ({
        ...patient,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        phone,
        email,
        source: input.source,
        treatmentInterest: interest?.name || patient.treatmentInterest,
        estimatedValue:
          interest && (patient.estimatedValue === 0 || patient.estimatedValue === previous?.price)
            ? interest.price
            : patient.estimatedValue,
        tags: [...patient.tags.filter((tag) => tag !== "posible" && tag !== "cliente"), input.kind],
        preferredChannel: phone ? patient.preferredChannel ?? "whatsapp" : "email",
      }));
      if (!updated) throw new Error("No se pudo guardar la ficha.");
      pushEvent(id, {
        channel: "system",
        direction: "internal",
        title: "Ficha editada",
        body: `${updated.fullName} · ${input.source}`,
      });
      persist();
      return clone(updated);
    },
    async saveFicha(id, input: FichaPatch) {
      if (!isOffline()) await wait(180);
      const current = patients.find((item) => item.id === id);
      if (!current) throw new Error("No encontramos la ficha.");
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const phone = input.phone.trim();
      const email = input.email.trim().toLowerCase();
      if (!firstName) throw new Error("Escriba el nombre.");
      if (digitsOf(phone).length < 9 && !email) throw new Error("Indique un teléfono o un correo.");
      if (!Number.isFinite(input.estimatedValue) || input.estimatedValue < 0) {
        throw new Error("El importe previsto no es válido.");
      }
      const tail = digitsOf(phone).slice(-9);
      const clash = patients.find((item) => {
        if (item.id === id) return false;
        if (tail.length >= 9 && digitsOf(item.phone).endsWith(tail)) return true;
        return Boolean(email) && item.email.trim().toLowerCase() === email;
      });
      if (clash) throw new Error(`Ese teléfono o correo ya está en la ficha de ${clash.fullName}.`);
      const visitPrice = new Map(input.visits.map((item) => [item.id, item.price]));
      const paymentAmount = new Map(input.payments.map((item) => [item.id, item.amount]));
      const updated = patchPatient(id, (patient) => ({
        ...patient,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        phone,
        email,
        city: input.city.trim(),
        birthday: input.birthday.trim() || undefined,
        source: input.source,
        treatmentInterest: input.treatmentInterest.trim() || patient.treatmentInterest,
        assignedTo: input.assignedTo.trim() || patient.assignedTo,
        estimatedValue: input.estimatedValue,
        ledgerTotal: input.estimatedValue,
        notes: input.notes,
        contraindications: input.contraindications.trim(),
        preferredChannel: phone ? patient.preferredChannel ?? "whatsapp" : "email",
        visits: (patient.visits ?? []).map((visit) => {
          const price = visitPrice.get(visit.id);
          if (price === undefined || !Number.isFinite(price) || price < 0) return visit;
          return { ...visit, price };
        }),
        payments: (patient.payments ?? []).map((payment) => {
          if (payment.status !== "pendiente") return payment;
          const amount = paymentAmount.get(payment.id);
          if (amount === undefined || !Number.isFinite(amount) || amount <= 0) return payment;
          return { ...payment, amount };
        }),
      }));
      if (!updated) throw new Error("No se pudo guardar la ficha.");
      pushEvent(id, {
        channel: "system",
        direction: "internal",
        title: "Ficha editada",
        body: updated.fullName,
      });
      persist();
      return clone(patients.find((item) => item.id === id) ?? updated);
    },
    async deletePatient(patientId: string) {
      if (!patients.some((item) => item.id === patientId)) return false;
      patients = patients.filter((item) => item.id !== patientId);
      delete timelines[patientId];
      waitlist = waitlist.filter((item) => item.patientId !== patientId);
      invoices = invoices.filter((item) => item.patientId !== patientId);
      outbox = outbox.filter((item) => item.patientId !== patientId);
      persist();
      return true;
    },
    async replyVisit(patientId, answer) {
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return "No encontramos la ficha.";
      const result = applyReply({ patients, waitlist, catalog, patientId, answer });
      patients = result.patients;
      waitlist = result.waitlist;
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: answer === "confirmada" ? "Cita confirmada" : "No puede acudir",
        body: result.message,
      });
      persist();
      return result.message;
    },
    async setVisitStatus(patientId, visitId, status) {
      const result = applyVisitStatus({ patients, waitlist, catalog, stock, patientId, visitId, status });
      patients = result.patients;
      waitlist = result.waitlist;
      stock = result.stock;
      const label = status === "realizada" ? "Visita hecha" : status === "ausente" ? "No asistió" : status === "cancelada" ? "Cita cancelada" : "Cita";
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: label,
        body: result.note || label,
      });
      persist();
      return clone(patients.find((item) => item.id === patientId) ?? null);
    },
    async ensurePortal(patientId) {
      const patient = patients.find((item) => item.id === patientId);
      if (!patient) return null;
      const token = patient.portalToken ?? portalToken();
      patchPatient(patientId, (current) => ({ ...current, portalToken: token }));
      const snap = currentSnapshot();
      const { publishSnapshot } = await import("./sync");
      await publishSnapshot(snap);
      return token;
    },
    async listDesk() {
      return clone({ stock, packs, tpv, closes });
    },
    async saveStock(items) {
      stock = items.map((item) => ({ ...item, quantity: Number(item.quantity) || 0, min: Number(item.min) || 0, perVisit: Number(item.perVisit) || 0 }));
      persist();
      return clone(stock);
    },
    async savePacks(items) {
      packs = items.filter((item) => item.name.trim() && item.steps.length > 0);
      persist();
      return clone(packs);
    },
    async assignPlan(patientId, packId, professional) {
      const pack = packs.find((item) => item.id === packId);
      const patient = patients.find((item) => item.id === patientId);
      if (!pack || !patient || !professional.trim()) return null;
      const plan = {
        id: `plan-${Date.now()}`,
        packId: pack.id,
        name: pack.name,
        professional: professional.trim(),
        steps: pack.steps.map((step) => ({ ...step, status: "pendiente" as const })),
      };
      pushEvent(patientId, {
        channel: "system",
        direction: "internal",
        title: "Plan de sesiones",
        body: `${pack.name} · ${professional.trim()}`,
      });
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          plans: [...(current.plans ?? []), plan],
        })),
      );
    },
    async setPlanProfessional(patientId, planId, professional) {
      if (!professional.trim()) return null;
      return clone(
        patchPatient(patientId, (current) => ({
          ...current,
          plans: (current.plans ?? []).map((plan) =>
            plan.id === planId ? { ...plan, professional: professional.trim() } : plan,
          ),
        })),
      );
    },
    async addTpv(line) {
      if (isDayClosed(closes, line.day)) throw new Error("caja: Ese día ya está cerrado.");
      const amount = Number(line.amount);
      if (!line.day || !Number.isFinite(amount) || amount <= 0) return null;
      const saved: TpvLine = {
        id: `tpv-${Date.now()}`,
        day: line.day,
        method: line.method,
        amount,
        concept: line.concept.trim() || "TPV",
      };
      tpv = [saved, ...tpv];
      persist();
      return clone(saved);
    },
    async closeDay(day) {
      if (!day) return null;
      const existing = closes.find((item) => item.day === day);
      if (existing) return clone(existing);
      const lines = tpv.filter((item) => item.day === day);
      const closed: CashClose = {
        day,
        closedAt: new Date().toISOString(),
        previsto: previstoByMethod(patients, day),
        tpv: tpvByMethod(lines, day),
        lines,
      };
      closes = [closed, ...closes];
      persist();
      return clone(closed);
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
