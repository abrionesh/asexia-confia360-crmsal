import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api, type AlarmChannel, type Patient } from "@/lib/api";
import { economics } from "@/lib/economics";
import { openMail, openWhatsApp } from "@/lib/outbound";
import { formatMoney } from "@/lib/utils";
import { downloadQuote } from "@/lib/quote-pdf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Attachments } from "@/components/files/attachments";

const STATUS_LABEL = {
  programada: "Programada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  ausente: "No asistió",
} as const;

export function ActionBar({ patient }: { patient: Patient }) {
  const refresh = useRefresh(patient.id);
  const [body, setBody] = useState("");
  const log = useMutation({
    mutationFn: (channel: "whatsapp" | "email" | "system") =>
      api.logContact(patient.id, { channel, body: body.trim() || greeting(patient) }),
    onSuccess: () => {
      setBody("");
      refresh();
    },
  });

  function send(channel: "whatsapp" | "email" | "system") {
    const text = body.trim() || greeting(patient);
    if (channel === "whatsapp") openWhatsApp(patient.phone, text);
    if (channel === "email") openMail(patient.email, "AsexiA Castellana", text);
    log.mutate(channel, {
      onSuccess: () => toast.success(channel === "system" ? "Nota en el historial" : "Queda en el historial"),
    });
  }

  return (
    <section className="rounded-xl bg-surface p-4 shadow-border">
      <p className="label-kicker">Contactar</p>
      <h2 className="mt-1 font-display text-xl font-medium text-ink">WhatsApp y correo</h2>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder={`Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`}
        aria-label="Mensaje para el paciente"
        className="mt-3 w-full rounded-md bg-bg px-3 py-2 text-sm text-ink shadow-border outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button disabled={log.isPending} onClick={() => send("whatsapp")}>
          <MessageCircle className="size-4" />
          WhatsApp
        </Button>
        <Button variant="secondary" disabled={log.isPending} onClick={() => send("email")}>
          <Mail className="size-4" />
          Correo
        </Button>
        <Button variant="outline" disabled={log.isPending || !body.trim()} onClick={() => send("system")}>
          Guardar nota
        </Button>
      </div>
    </section>
  );
}

export function FileCanvas({ patient }: { patient: Patient }) {
  const catalogQuery = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const catalog = catalogQuery.data;
  const money = economics(patient);
  const visits = [...(patient.visits ?? [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl bg-surface p-4 shadow-border">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="label-kicker">Canvas de la ficha</p>
            <h2 className="mt-1 font-display text-xl font-medium text-ink">Historial de citas</h2>
          </div>
          <p className="text-xs text-ink-subtle">{visits.length}</p>
        </div>
        {visits.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Todavía no hay citas en esta ficha.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {visits.map((visit) => (
              <li key={visit.id} className="rounded-lg bg-bg p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={visit.status === "realizada" ? "success" : visit.status === "programada" ? "ink" : "muted"}>
                    {STATUS_LABEL[visit.status]}
                  </Badge>
                  <span className="text-xs text-ink-subtle">
                    {format(new Date(visit.at), "EEEE d MMM · HH:mm", { locale: es })}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{visit.activityName}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {visit.roomName} · {visit.durationMin} min · {visit.professional}
                </p>
                <p className="mt-1 text-sm text-ink">{formatMoney(visit.price)}</p>
                {visit.notes ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{visit.notes}</p> : null}
                <Attachments
                  target={{ kind: "visit", patientId: patient.id, visitId: visit.id }}
                  files={visit.files ?? []}
                  title="Documentos de la cita"
                />
              </li>
            ))}
          </ul>
        )}
        {catalog ? <VisitForm patient={patient} activities={catalog.activities} rooms={catalog.rooms} /> : null}
        <Attachments target={{ kind: "patient", patientId: patient.id }} files={patient.files ?? []} title="Documentos de la ficha" />
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Economía</p>
        <h2 className="mt-1 font-display text-xl font-medium text-ink">Total, cobrado y pendiente</h2>
        <Button className="mt-3" variant="outline" onClick={() => downloadQuote(patient)}>
          Presupuesto PDF
        </Button>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Money label="Total" value={money.total} />
          <Money label="Cobrado" value={money.collected} />
          <Money label="Pendiente" value={money.pending} />
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {(patient.payments ?? []).map((payment) => (
            <li key={payment.id} className="flex items-start justify-between gap-3 text-sm">
              <span>
                <span className="block font-medium text-ink">{payment.concept}</span>
                <span className="text-xs text-ink-subtle">
                  {format(new Date(payment.dueAt), "d MMM yyyy", { locale: es })} · {payment.status}
                </span>
              </span>
              <span className="tabular-nums text-ink">{formatMoney(payment.amount)}</span>
            </li>
          ))}
        </ul>
        {(patient.payments ?? [])
          .filter((payment) => payment.status === "pendiente")
          .map((payment) => (
            <CollectButton key={payment.id} patientId={patient.id} paymentId={payment.id} />
          ))}
        <PaymentForm patientId={patient.id} />
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Pendientes</p>
        <ul className="mt-3 flex flex-col gap-2">
          {(patient.pendings ?? []).length === 0 ? (
            <li className="text-sm text-ink-muted">No hay pendientes abiertos.</li>
          ) : (
            (patient.pendings ?? []).map((task) => (
              <li key={task.id}>
                <PendingToggle patientId={patient.id} id={task.id} title={task.title} done={task.done} />
              </li>
            ))
          )}
        </ul>
        <PendingForm patientId={patient.id} />
      </section>

      <AlarmForm patient={patient} />
      <Satisfaction patient={patient} />
    </div>
  );
}

function Money({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-bg px-3 py-2">
      <p className="text-2xs text-ink-subtle">{label}</p>
      <p className="mt-1 font-display text-lg tabular-nums text-ink">{formatMoney(value)}</p>
    </div>
  );
}

function CollectButton({ patientId, paymentId }: { patientId: string; paymentId: string }) {
  const refresh = useRefresh(patientId);
  const collect = useMutation({
    mutationFn: () => api.collectPayment(patientId, paymentId),
    onSuccess: () => {
      refresh();
      toast.success("Entra en la caja de hoy");
    },
  });
  return (
    <Button className="mt-2" size="sm" variant="secondary" disabled={collect.isPending} onClick={() => collect.mutate()}>
      Cobrar en caja
    </Button>
  );
}

function Satisfaction({ patient }: { patient: Patient }) {
  const refresh = useRefresh(patient.id);
  const save = useMutation({
    mutationFn: (score: "bien" | "regular" | "mal") => api.recordSatisfaction(patient.id, score),
    onSuccess: () => {
      refresh();
      toast.success("Respuesta guardada");
    },
  });
  const due = (patient.visits ?? []).some(
    (visit) => visit.status === "realizada" && Date.now() - new Date(visit.at).getTime() > 48 * 3_600_000,
  );
  if (!due && !patient.satisfaction) return null;
  return (
    <section className="rounded-xl bg-surface p-4 shadow-border">
      <p className="label-kicker">48 horas</p>
      <h2 className="mt-1 text-sm font-medium text-ink">¿Cómo se encuentra?</h2>
      {patient.satisfaction ? (
        <p className="mt-2 text-sm text-ink-muted">Respondió: {patient.satisfaction}.</p>
      ) : (
        <div className="mt-3 flex gap-2">
          {(["bien", "regular", "mal"] as const).map((score) => (
            <Button key={score} size="sm" variant="outline" disabled={save.isPending} onClick={() => save.mutate(score)}>
              {score === "bien" ? "Bien" : score === "regular" ? "Regular" : "Mal"}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}

function VisitForm({
  patient,
  activities,
  rooms,
}: {
  patient: Patient;
  activities: { id: string; name: string }[];
  rooms: { id: string; name: string }[];
}) {
  const refresh = useRefresh(patient.id);
  const [open, setOpen] = useState(false);
  const [activityId, setActivityId] = useState(activities[0]?.id ?? "");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [at, setAt] = useState(localInput(new Date(Date.now() + 86_400_000)));
  const [professional, setProfessional] = useState(patient.assignedTo);
  const [notes, setNotes] = useState("");
  const save = useMutation({
    mutationFn: () =>
      api.addVisit(patient.id, { at: new Date(at).toISOString(), activityId, roomId, professional, notes }),
    onSuccess: () => {
      setNotes("");
      setOpen(false);
      refresh();
      toast.success("Cita en el historial y en la agenda");
    },
    onError: (error: Error) => {
      if (error.message === "consent") {
        toast.error("Falta el consentimiento. No se programa quirófano.");
      }
    },
  });

  if (!open) {
    return (
      <Button className="mt-4" variant="outline" onClick={() => setOpen(true)}>
        Añadir cita
      </Button>
    );
  }

  return (
    <form
      className="mt-4 flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <Select label="Actividad" value={activityId} onChange={setActivityId} options={activities.map((item) => ({ id: item.id, label: item.name }))} />
      <Select label="Sala" value={roomId} onChange={setRoomId} options={rooms.map((item) => ({ id: item.id, label: item.name }))} />
      <Input type="datetime-local" value={at} onChange={(event) => setAt(event.target.value)} aria-label="Fecha de la cita" required />
      <Input value={professional} onChange={(event) => setProfessional(event.target.value)} aria-label="Profesional" />
      <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Detalle de la cita" aria-label="Notas de la cita" />
      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>Guardar cita</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cerrar</Button>
      </div>
    </form>
  );
}

function PaymentForm({ patientId }: { patientId: string }) {
  const refresh = useRefresh(patientId);
  const [open, setOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [dueAt, setDueAt] = useState(localInput(new Date()).slice(0, 10));
  const [status, setStatus] = useState<"pendiente" | "cobrado">("pendiente");
  const save = useMutation({
    mutationFn: () =>
      api.addPayment(patientId, {
        concept,
        amount: Number(amount),
        dueAt: new Date(dueAt).toISOString(),
        status,
      }),
    onSuccess: () => {
      setConcept("");
      setAmount("");
      setOpen(false);
      refresh();
      toast.success("Pago guardado. Si vence pronto, salta la alarma.");
    },
  });

  if (!open) {
    return (
      <Button className="mt-4" variant="outline" onClick={() => setOpen(true)}>
        Planificar pago
      </Button>
    );
  }

  return (
    <form
      className="mt-4 flex flex-col gap-2"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        if (!concept.trim() || Number(amount) <= 0) return;
        save.mutate();
      }}
    >
      <Input value={concept} onChange={(event) => setConcept(event.target.value)} placeholder="Concepto" aria-label="Concepto del pago" required />
      <Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="1" placeholder="Importe" aria-label="Importe" required />
      <Input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} aria-label="Fecha del pago" required />
      <Select
        label="Estado"
        value={status}
        onChange={(value) => setStatus(value as "pendiente" | "cobrado")}
        options={[
          { id: "pendiente", label: "Pendiente" },
          { id: "cobrado", label: "Cobrado" },
        ]}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>Guardar pago</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cerrar</Button>
      </div>
    </form>
  );
}

function PendingForm({ patientId }: { patientId: string }) {
  const refresh = useRefresh(patientId);
  const [title, setTitle] = useState("");
  const save = useMutation({
    mutationFn: () => api.addPending(patientId, title),
    onSuccess: () => {
      setTitle("");
      refresh();
    },
  });
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return;
        save.mutate();
      }}
    >
      <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nuevo pendiente" aria-label="Nuevo pendiente" />
      <Button type="submit" variant="outline" disabled={save.isPending || !title.trim()}>
        Añadir
      </Button>
    </form>
  );
}

function PendingToggle({
  patientId,
  id,
  title,
  done,
}: {
  patientId: string;
  id: string;
  title: string;
  done: boolean;
}) {
  const refresh = useRefresh(patientId);
  const toggle = useMutation({
    mutationFn: () => api.togglePending(patientId, id),
    onSuccess: () => refresh(),
  });
  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      className="flex min-h-11 w-full items-center gap-3 text-left text-sm"
    >
      <span className={`size-4 shrink-0 rounded-full border ${done ? "border-success bg-success" : "border-border-strong"}`} />
      <span className={done ? "text-ink-subtle line-through" : "text-ink"}>{title}</span>
    </button>
  );
}

function AlarmForm({ patient }: { patient: Patient }) {
  const refresh = useRefresh(patient.id);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState(localInput(new Date(Date.now() + 86_400_000)));
  const [channel, setChannel] = useState<AlarmChannel>("whatsapp");
  const [draft, setDraft] = useState(`Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`);
  const save = useMutation({
    mutationFn: () =>
      api.addManualAlarm(patient.id, {
        title,
        dueAt: new Date(dueAt).toISOString(),
        channel,
        draft,
      }),
    onSuccess: () => {
      setTitle("");
      setOpen(false);
      refresh();
      toast.success("Alarma creada");
    },
  });

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Crear alarma
      </Button>
    );
  }

  return (
    <form
      className="rounded-xl bg-surface p-4 shadow-border"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !draft.trim()) return;
        save.mutate();
      }}
    >
      <p className="label-kicker">Nueva alarma</p>
      <div className="mt-3 flex flex-col gap-2">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Motivo" aria-label="Motivo de la alarma" required />
        <Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} aria-label="Cuándo avisar" required />
        <Select
          label="Canal"
          value={channel}
          onChange={(value) => setChannel(value as AlarmChannel)}
          options={[
            { id: "whatsapp", label: "WhatsApp" },
            { id: "email", label: "Correo" },
            { id: "internal", label: "Llamada interna" },
          ]}
        />
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          aria-label="Texto de la alarma"
          className="w-full rounded-md bg-bg px-3 py-2 text-sm text-ink shadow-border outline-none"
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>Guardar alarma</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cerrar</Button>
        </div>
      </div>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="block text-xs text-ink-subtle">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function useRefresh(patientId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
    void queryClient.invalidateQueries({ queryKey: ["timeline", patientId] });
    void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    void queryClient.invalidateQueries({ queryKey: ["alarms"] });
    void queryClient.invalidateQueries({ queryKey: ["metrics"] });
  };
}

function greeting(patient: Patient) {
  return `Hola ${patient.firstName}, le escribimos de AsexiA Castellana.`;
}

function localInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
