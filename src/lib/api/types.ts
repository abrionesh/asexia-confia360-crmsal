/**
 * Domain contract for AsexiA Suite 360.
 *
 * UI components depend only on these types + `api` in `./client`.
 * Swap the mock client for REST or Odoo XML-RPC without touching views.
 */

export const PIPELINE_STAGES = [
  {
    id: "new",
    label: "Nuevo Contacto",
    hint: "Entrada",
  },
  {
    id: "qualified",
    label: "Cualificado por IA",
    hint: "Score alto",
  },
  {
    id: "proposal",
    label: "Propuesta",
    hint: "Presupuesto",
  },
  {
    id: "confirmed",
    label: "Cita Confirmada",
    hint: "Agenda",
  },
  {
    id: "followup",
    label: "Seguimiento",
    hint: "Cuidados",
  },
  {
    id: "invoiced",
    label: "Facturado",
    hint: "Cierre",
  },
  {
    id: "lost",
    label: "Perdido",
    hint: "No insistir",
  },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["id"];

export interface ClinicFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  addedAt: string;
  /** Small files only. Large ones keep the name so the phone storage stays light. */
  dataUrl?: string;
}

export type FileTarget =
  | { kind: "patient"; patientId: string }
  | { kind: "visit"; patientId: string; visitId: string }
  | { kind: "professional"; professionalId: string }
  | { kind: "activity"; activityId: string };

export type LeadSource =
  | "Instagram"
  | "Google Ads"
  | "WhatsApp"
  | "Web"
  | "Referral"
  | "Llamada";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  clinic: string;
  treatmentInterest: string;
  estimatedValue: number;
  source: LeadSource;
  stage: PipelineStage;
  assignedTo: string;
  lastActivityAt: string;
  createdAt: string;
  tags: string[];
  notes: string;
  aiScore?: number;
  nextAction?: string;
  /** Set when the visit is already billed but care is still open. */
  billed?: boolean;
  appointmentAt?: string;
  preferredChannel?: "whatsapp" | "email" | "call";
  care?: CareItem[];
  birthday?: string;
  /** Contracted amount. Collected and pending are derived from `payments`. */
  ledgerTotal?: number;
  visits?: Visit[];
  payments?: PlannedPayment[];
  pendings?: PendingTask[];
  manualAlarms?: ManualAlarm[];
  contraindications?: string;
  consentSigned?: boolean;
  lostReason?: string;
  satisfaction?: "bien" | "regular" | "mal";
  files?: ClinicFile[];
}

export type CareKind = "prep" | "aftercare" | "review" | "nurture";

export interface CareItem {
  id: string;
  kind: CareKind;
  title: string;
  body: string;
  dueAt: string;
}

export type AlarmKind =
  | "reminder"
  | "prep"
  | "silence"
  | "aftercare"
  | "review"
  | "nurture"
  | "birthday"
  | "payment"
  | "custom"
  | "satisfaction";
export type AlarmChannel = "whatsapp" | "email" | "internal";
export type AlarmStatus = "due" | "scheduled" | "sent" | "dismissed";

export interface Alarm {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  email: string;
  kind: AlarmKind;
  channel: AlarmChannel;
  status: AlarmStatus;
  dueAt: string;
  title: string;
  reason: string;
  draft: string;
}

export interface Visit {
  id: string;
  at: string;
  activityId: string;
  activityName: string;
  roomId: string;
  roomName: string;
  durationMin: number;
  professional: string;
  status: "programada" | "realizada" | "cancelada" | "ausente";
  notes: string;
  price: number;
  files?: ClinicFile[];
}

export interface PlannedPayment {
  id: string;
  dueAt: string;
  amount: number;
  concept: string;
  status: "pendiente" | "cobrado";
  paidAt?: string;
}

export interface PendingTask {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface ManualAlarm {
  id: string;
  title: string;
  dueAt: string;
  channel: AlarmChannel;
  draft: string;
}

export interface ActivityLink {
  label: string;
  url: string;
}

export interface Activity {
  id: string;
  sector: string;
  subsector: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  cost: number;
  color: string;
  code: string;
  links: ActivityLink[];
  professionalIds: string[];
  files?: ClinicFile[];
  /** Days after a completed visit before a recall alarm. Empty means no recall. */
  recallDays?: number;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  color: string;
  license?: string;
  cv?: string;
  hours: OpeningDay[];
  /** Coste del profesional en esa actividad. Si no hay cifra, se usa el coste de la actividad. */
  activityCosts: { activityId: string; cost: number }[];
  files?: ClinicFile[];
}

export interface Room {
  id: string;
  name: string;
}

export interface OpeningDay {
  day: number;
  label: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface ClinicCatalog {
  activities: Activity[];
  rooms: Room[];
  hours: OpeningDay[];
  professionals: Professional[];
}

export interface ContactLog {
  channel: "whatsapp" | "email" | "system";
  body: string;
}

export interface VisitInput {
  at: string;
  activityId: string;
  roomId: string;
  professional: string;
  notes: string;
}

export interface PaymentInput {
  dueAt: string;
  amount: number;
  concept: string;
  status: "pendiente" | "cobrado";
}

export interface ManualAlarmInput {
  title: string;
  dueAt: string;
  channel: AlarmChannel;
  draft: string;
}
export type TimelineChannel = "whatsapp" | "voice" | "system" | "email";
export type TimelineDirection = "inbound" | "outbound" | "internal";

export interface TimelineEvent {
  id: string;
  patientId: string;
  channel: TimelineChannel;
  direction: TimelineDirection;
  at: string;
  title: string;
  body: string;
  durationSec?: number;
  agent?: string;
  transcript?: VoiceTurn[];
  delivery?: "preparado" | "enviado" | "fallido";
}

export interface VoiceTurn {
  speaker: "agent" | "patient";
  text: string;
}

export interface WaitEntry {
  id: string;
  patientId: string;
  patientName: string;
  activityId: string;
  activityName: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  at: string;
  patientId: string;
  patientName: string;
  concept: string;
  base: number;
  vatRate: number;
  vat: number;
  total: number;
  paymentId?: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface PipelineMetrics {
  leadCount: number;
  pipelineValue: number;
  conversionRate: number;
  appointmentsThisWeek: number;
  averageTicket: number;
}

export interface AsexiAApi {
  listPipeline(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | null>;
  listTimeline(patientId: string): Promise<TimelineEvent[]>;
  movePatient(id: string, stage: PipelineStage): Promise<Patient>;
  getMetrics(): Promise<PipelineMetrics>;
  askCopilot(prompt: string, patients: Patient[]): Promise<CopilotMessage>;
  listAlarms(): Promise<Alarm[]>;
  listOpenAlarms(): Promise<Alarm[]>;
  listPatientAlarms(patientId: string): Promise<Alarm[]>;
  resolveAlarm(id: string, status: "sent" | "dismissed"): Promise<Alarm | null>;
  getCatalog(): Promise<ClinicCatalog>;
  saveCatalog(catalog: ClinicCatalog): Promise<ClinicCatalog>;
  logContact(patientId: string, entry: ContactLog): Promise<Patient | null>;
  addVisit(patientId: string, input: VisitInput): Promise<Patient | null>;
  addPayment(patientId: string, input: PaymentInput): Promise<Patient | null>;
  addPending(patientId: string, title: string): Promise<Patient | null>;
  togglePending(patientId: string, pendingId: string): Promise<Patient | null>;
  addManualAlarm(patientId: string, input: ManualAlarmInput): Promise<Patient | null>;
  signConsent(patientId: string): Promise<Patient | null>;
  setContraindications(patientId: string, text: string): Promise<Patient | null>;
  markLost(patientId: string, reason: string): Promise<Patient | null>;
  recordSatisfaction(patientId: string, score: "bien" | "regular" | "mal"): Promise<Patient | null>;
  collectPayment(patientId: string, paymentId: string): Promise<Patient | null>;
  attachFile(target: FileTarget, file: Omit<ClinicFile, "id" | "addedAt">): Promise<ClinicFile | null>;
  removeFile(target: FileTarget, fileId: string): Promise<boolean>;
  dismissPrediction(id: string): Promise<string[]>;
  listDismissed(): Promise<string[]>;
  listWait(): Promise<WaitEntry[]>;
  addWait(patientId: string, activityId: string): Promise<WaitEntry | null>;
  removeWait(id: string): Promise<boolean>;
  placeWait(id: string, roomId: string, day: string): Promise<Patient | null>;
  markDelivery(patientId: string, eventId: string, delivery: "enviado" | "fallido"): Promise<boolean>;
  issueInvoice(patientId: string, paymentId: string, vatRate: number): Promise<Invoice | null>;
  listInvoices(): Promise<Invoice[]>;
  deletePatient(patientId: string): Promise<boolean>;
}

export function stageMeta(id: PipelineStage) {
  return PIPELINE_STAGES.find((stage) => stage.id === id) ?? PIPELINE_STAGES[0];
}
