import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { api, type Alarm, type AlarmKind } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const KIND_LABEL: Record<AlarmKind, string> = {
  reminder: "Cita",
  prep: "Preparación",
  silence: "Silencio",
  aftercare: "Cuidado",
  review: "Revisión",
  nurture: "Seguimiento",
  birthday: "Cumpleaños",
  payment: "Cobro",
  custom: "Aviso",
  satisfaction: "48 h",
};

const KIND_TONE = {
  reminder: "ink",
  prep: "warning",
  silence: "warning",
  aftercare: "voice",
  review: "accent",
  nurture: "muted",
  birthday: "accent",
  payment: "success",
  custom: "ink",
  satisfaction: "voice",
} as const;

export function AlarmStack({
  alarms,
  layout,
  empty,
}: {
  alarms: Alarm[];
  layout: "strip" | "stack";
  empty: string;
}) {
  const queryClient = useQueryClient();
  const resolve = useResolveAlarm();
  if (alarms.length === 0) {
    return <p className="rounded-xl bg-surface px-4 py-3 text-sm text-ink-muted shadow-border">{empty}</p>;
  }
  return (
    <div className={layout === "strip" ? "flex gap-3 overflow-x-auto pb-1" : "flex flex-col gap-3"}>
      {alarms.map((alarm) => (
        <article
          key={alarm.id}
          className={`flex flex-col rounded-xl bg-surface p-3 shadow-border ${layout === "strip" ? "w-72 shrink-0" : ""}`}
        >
          <div className="flex items-center justify-between gap-2">
            <Badge tone={KIND_TONE[alarm.kind]}>{KIND_LABEL[alarm.kind]}</Badge>
            <span className="text-2xs text-ink-subtle">
              {alarm.status === "due" ? "Vencida" : "Programada"}
            </span>
          </div>
          <Link to="/pacientes/$id" params={{ id: alarm.patientId }} className="mt-2 truncate text-sm font-medium text-ink">
            {alarm.patientName}
          </Link>
          <p className="mt-0.5 text-sm text-ink">{alarm.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{alarm.reason}</p>
          <div className="mt-3 flex gap-2">
            <AlarmActions
              alarm={alarm}
              busy={resolve.isPending}
              onSend={(via) => {
                openOutbound(alarm, via);
                resolve.mutate(
                  { id: alarm.id, status: "sent" },
                  {
                    onSuccess: () => {
                      toast.success(`${alarm.patientName} · mensaje listo`);
                      void queryClient.invalidateQueries({ queryKey: ["timeline", alarm.patientId] });
                    },
                  },
                );
              }}
              onDismiss={() => resolve.mutate({ id: alarm.id, status: "dismissed" })}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

export function PatientAlarms({ patientId }: { patientId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["alarms", patientId],
    queryFn: () => api.listPatientAlarms(patientId),
  });
  const resolve = useResolveAlarm();

  return (
    <section className="rounded-xl bg-surface p-4 shadow-border">
      <p className="label-kicker">Alarmas de la ficha</p>
      <h2 className="mt-1 font-display text-xl font-medium text-ink">Qué avisar</h2>
      {query.isPending ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (query.data ?? []).length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">
          Nada vencido ni previsto en 24 h. Un cuidado futuro aparece aquí el día antes.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {(query.data ?? []).map((alarm) => (
            <li key={alarm.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={KIND_TONE[alarm.kind]}>{KIND_LABEL[alarm.kind]}</Badge>
                <Badge tone={alarm.status === "sent" ? "success" : alarm.status === "due" ? "warning" : "muted"}>
                  {alarm.status === "sent" ? "Enviado" : alarm.status === "due" ? "Vencida" : "Programada"}
                </Badge>
                <span className="text-xs text-ink-subtle">
                  {formatDistanceToNow(new Date(alarm.dueAt), { addSuffix: true, locale: es })}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{alarm.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{alarm.reason}</p>
              <p className="mt-2 rounded-lg bg-bg px-3 py-2 text-sm text-ink">{alarm.draft}</p>
              {alarm.status === "sent" ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <AlarmActions
                    alarm={alarm}
                    busy={resolve.isPending}
                    onSend={(via) => {
                      openOutbound(alarm, via);
                      resolve.mutate(
                        { id: alarm.id, status: "sent" },
                        {
                          onSuccess: () => {
                            toast.success("Queda en el timeline");
                            void queryClient.invalidateQueries({ queryKey: ["timeline", patientId] });
                          },
                        },
                      );
                    }}
                    onDismiss={() => resolve.mutate({ id: alarm.id, status: "dismissed" })}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AlarmActions({
  alarm,
  busy,
  onSend,
  onDismiss,
}: {
  alarm: Alarm;
  busy: boolean;
  onSend: (via: "whatsapp" | "email" | "call") => void;
  onDismiss: () => void;
}) {
  if (alarm.channel === "internal") {
    return (
      <>
        <Button size="sm" disabled={busy} onClick={() => onSend("call")}>
          <Phone className="size-4" />
          Registrar llamada
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={onDismiss}>
          Descartar
        </Button>
      </>
    );
  }

  return (
    <>
      <Button size="sm" disabled={busy} onClick={() => onSend("whatsapp")}>
        <MessageCircle className="size-4" />
        WhatsApp
      </Button>
      <Button size="sm" variant="secondary" disabled={busy} onClick={() => onSend("email")}>
        <Mail className="size-4" />
        Correo
      </Button>
      <Button size="sm" variant="ghost" disabled={busy} onClick={onDismiss}>
        Descartar
      </Button>
    </>
  );
}

function useResolveAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "sent" | "dismissed" }) =>
      api.resolveAlarm(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alarms"] });
    },
  });
}

function openOutbound(alarm: Alarm, via: "whatsapp" | "email" | "call") {
  if (via === "call") return;
  if (via === "whatsapp") {
    const phone = alarm.phone.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(alarm.draft)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const href = `mailto:${encodeURIComponent(alarm.email)}?subject=${encodeURIComponent(
    `AsexiA · ${alarm.title}`,
  )}&body=${encodeURIComponent(alarm.draft)}`;
  window.location.href = href;
}
