import type {
  CashClose,
  ClinicCatalog,
  Invoice,
  Patient,
  PipelineStage,
  StockItem,
  TimelineEvent,
  TreatmentPack,
  TpvLine,
  WaitEntry,
} from "./types";

const KEY = "asexia.snapshot.v9";

export interface OutboxItem {
  id: string;
  kind: "move";
  patientId: string;
  stage: PipelineStage;
  at: string;
}

export interface Snapshot {
  revision?: number;
  patients: Patient[];
  outbox: OutboxItem[];
  resolvedAlarms?: Record<string, "sent" | "dismissed">;
  timelines?: Record<string, TimelineEvent[]>;
  catalog?: ClinicCatalog;
  waitlist?: WaitEntry[];
  dismissedPredictions?: string[];
  invoices?: Invoice[];
  invoiceSeq?: number;
  stock?: StockItem[];
  packs?: TreatmentPack[];
  tpv?: TpvLine[];
  closes?: CashClose[];
}

export function parseSnapshot(value: unknown): Snapshot | null {
  if (!value) return null;
  try {
    const parsed = (typeof value === "string" ? JSON.parse(value) : value) as Snapshot;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.patients)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function readSnapshot(): Snapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return parseSnapshot(raw);
  } catch {
    return null;
  }
}

export function writeSnapshot(snapshot: Snapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* private mode or quota — the in-memory board still works */
  }
}
