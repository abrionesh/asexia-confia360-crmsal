import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { api, type Alarm, type Patient } from "@/lib/api";
import { buildPredictions } from "@/lib/predictions";
import { openWhatsApp } from "@/lib/outbound";
import { useUiStore } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
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
  const dismissed = useQuery({ queryKey: ["dismissed"], queryFn: () => api.listDismissed() });
  const predictions =
    pipeline.data && catalog.data
      ? buildPredictions(visiblePeople, catalog.data).filter((item) => !(dismissed.data ?? []).includes(item.id))
      : [];
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["dismissed"] });
    void queryClient.invalidateQueries({ queryKey: ["alarms"] });
    void queryClient.invalidateQueries({ queryKey: ["wait"] });
    void queryClient.invalidateQueries({ queryKey: ["patient"] });
  };
  const actOn = useMutation({
    mutationFn: async (run: () => Promise<unknown>) => run(),
    onSuccess: () => refresh(),
  });

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
          {predictions.map((item) => {
            const person = people.find((patient) => patient.id === item.patientId);
            return (
              <li key={item.id} className="rounded-xl bg-surface p-4 shadow-border">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{item.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {person ? (
                    <Button
                      size="sm"
                      disabled={actOn.isPending}
                      onClick={() =>
                        actOn.mutate(async () => {
                          openWhatsApp(person.phone, item.reason);
                          await api.logContact(person.id, { channel: "whatsapp", body: item.reason });
                          toast.success("WhatsApp preparado. Confirme en el historial si salió.");
                        })
                      }
                    >
                      WhatsApp
                    </Button>
                  ) : null}
                  {person ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={actOn.isPending}
                      onClick={() =>
                        actOn.mutate(async () => {
                          await api.addManualAlarm(person.id, {
                            title: item.title,
                            dueAt: new Date().toISOString(),
                            channel: "whatsapp",
                            draft: item.reason,
                          });
                          toast.success("Alarma creada");
                        })
                      }
                    >
                      Crear alarma
                    </Button>
                  ) : null}
                  {person && item.activityId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actOn.isPending}
                      onClick={() =>
                        actOn.mutate(async () => {
                          await api.addWait(person.id, item.activityId!);
                          toast.success("En la lista de espera");
                        })
                      }
                    >
                      Lista de espera
                    </Button>
                  ) : null}
                  {item.patientId ? (
                    <Link to="/pacientes/$id" params={{ id: item.patientId }} className="inline-flex h-9 items-center px-2 text-sm font-medium text-accent">
                      Ficha
                    </Link>
                  ) : item.to ? (
                    <Link to={item.to} className="inline-flex h-9 items-center px-2 text-sm font-medium text-accent">
                      Agenda
                    </Link>
                  ) : null}
                  <Button size="sm" variant="ghost" disabled={actOn.isPending} onClick={() => actOn.mutate(() => api.dismissPrediction(item.id))}>
                    Descartar
                  </Button>
                </div>
              </li>
            );
          })}
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
