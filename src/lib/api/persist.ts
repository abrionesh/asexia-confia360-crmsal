import type { ClinicCatalog, Patient, PipelineStage, TimelineEvent } from "./types";

const KEY = "asexia.snapshot.v6";

export interface OutboxItem {
  id: string;
  kind: "move";
  patientId: string;
  stage: PipelineStage;
  at: string;
}

export interface Snapshot {
  patients: Patient[];
  outbox: OutboxItem[];
  resolvedAlarms?: Record<string, "sent" | "dismissed">;
  timelines?: Record<string, TimelineEvent[]>;
  catalog?: ClinicCatalog;
}

export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function readSnapshot(): Snapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot;
    if (!Array.isArray(parsed.patients)) return null;
    return {
      patients: parsed.patients,
      outbox: parsed.outbox ?? [],
      resolvedAlarms: parsed.resolvedAlarms ?? {},
      timelines: parsed.timelines,
      catalog: parsed.catalog,
    };
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
