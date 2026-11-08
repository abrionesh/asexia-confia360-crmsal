import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api, type Alarm, type Patient } from "@/lib/api";
import { buildPredictions } from "@/lib/predictions";
import { useUiStore } from "@/lib/store/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { AlarmStack } from "@/components/alarms/queue";

const MODES = [
  ["actuar", "Actuar"],
  ["alarmas", "Alarmas"],
  ["predicciones", "Predicciones"],
] as const;

type Mode = (typeof MODES)[number][0];

const DAY = 24 * 3_600_000;
const BIRTHDAY = 7 * DAY;

export function ActuarHub() {
  const role = useUiStore((state) => state.role);
  const doctor = useUiStore((state) => state.doctor);
  const [mode, setMode] = useState<Mode>("actuar");
  const alarms = useQuery({ queryKey: ["alarms", "all"], queryFn: () => api.listOpenAlarms() });
  const pipeline = useQuery({ queryKey: ["pipeline"], queryFn: () => api.listPipeline() });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });

  const loading = alarms.isPending || pipeline.isPending || catalog.isPending;
  const people = pipeline.data ?? [];
  const visiblePeople =
    role === "medico" ? people.filter((patient) => owns(patient, doctor)) : people;
  const visibleIds = new Set(visiblePeople.map((patient) => patient.id));
  const list = (alarms.data ?? []).filter((alarm) => role !== "medico" || visibleIds.has(alarm.patientId));
  const now = Date.now();
  const dueSoon = list.filter((alarm) => isActionable(alarm, now));
  const later = list.filter((alarm) => !isActionable(alarm, now));
  const predictions =
    pipeline.data && catalog.data
      ? buildPredictions(visiblePeople, catalog.data).filter((item) => !item.patientId || visibleIds.has(item.patientId))
      : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="label-kicker">Actuar</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Qué hay que hacer</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Lo urgente, las alarmas que vienen y lo que el historial deja prever. El tablero se queda para mover fichas.
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {MODES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`h-10 shrink-0 rounded-full px-3 text-sm font-medium ${mode === id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`}
          >
            {label}
            {id === "actuar" ? ` · ${loading ? "…" : dueSoon.length}` : ""}
            {id === "predicciones" ? ` · ${loading ? "…" : predictions.length}` : ""}
          </button>
        ))}
      </div>
      {loading || !catalog.data ? (
        <Skeleton className="h-36 rounded-xl" />
      ) : mode === "actuar" ? (
        <AlarmStack alarms={dueSoon} layout="stack" empty="Nada que actuar ahora. Las citas lejanas están en Alarmas." />
      ) : mode === "alarmas" ? (
        <AlarmStack alarms={later} layout="stack" empty="No hay alarmas más allá de lo que ya está en Actuar." />
      ) : predictions.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-6 text-sm text-ink-muted shadow-border">Sin señales nuevas.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {predictions.map((item) => (
            <li key={item.id} className="rounded-xl bg-surface p-4 shadow-border">
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{item.reason}</p>
              {item.patientId ? (
                <Link to="/pacientes/$id" params={{ id: item.patientId }} className="mt-2 inline-flex h-10 items-center text-sm font-medium text-accent">
                  Abrir ficha
                </Link>
              ) : item.to ? (
                <Link to={item.to} className="mt-2 inline-flex h-10 items-center text-sm font-medium text-accent">
                  Ver
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function isActionable(alarm: Alarm, now: number) {
  const due = new Date(alarm.dueAt).getTime();
  const window = alarm.kind === "birthday" ? BIRTHDAY : DAY;
  return alarm.status === "due" || due <= now + window;
}

function owns(patient: Patient, doctor: string) {
  if (!doctor) return true;
  if (patient.assignedTo === doctor) return true;
  return (patient.visits ?? []).some((visit) => visit.professional === doctor);
}
