import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { LeadSource } from "@/lib/api/types";
import { useUiStore } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SOURCES: { id: LeadSource; label: string }[] = [
  { id: "Mostrador", label: "Mostrador" },
  { id: "Llamada", label: "Llamada" },
  { id: "WhatsApp", label: "WhatsApp" },
  { id: "Web", label: "Web" },
  { id: "Instagram", label: "Instagram" },
  { id: "Google Ads", label: "Google Ads" },
  { id: "Referral", label: "Recomendado" },
];

export function AdmitButton({ day, startWithVisit }: { day?: Date; startWithVisit?: boolean }) {
  const role = useUiStore((state) => state.role);
  const [open, setOpen] = useState(false);
  if (role === "medico") return null;
  return (
    <div className="flex flex-col gap-3">
      <Button type="button" className="w-fit" onClick={() => setOpen((value) => !value)}>
        {open ? "Cerrar alta" : "Nueva ficha"}
      </Button>
      {open ? (
        <AdmitForm key={day ? format(day, "yyyy-MM-dd") : "alta"} day={day} startWithVisit={startWithVisit} onDone={() => setOpen(false)} />
      ) : null}
    </div>
  );
}

function AdmitForm({
  day,
  startWithVisit,
  onDone,
}: {
  day?: Date;
  startWithVisit?: boolean;
  onDone: () => void;
}) {
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState<"posible" | "cliente">("posible");
  const [source, setSource] = useState<LeadSource>("Mostrador");
  const [interest, setInterest] = useState("");
  const [withVisit, setWithVisit] = useState(Boolean(startWithVisit));
  const [date, setDate] = useState(format(day ?? new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("10:00");
  const [roomId, setRoomId] = useState("sala-1");
  const [professional, setProfessional] = useState("");

  const save = useMutation({
    mutationFn: () => {
      const data = catalog.data;
      const activityId = interest || data?.activities[0]?.id || "revision";
      const visit = withVisit
        ? {
            at: new Date(`${date}T${time}`).toISOString(),
            activityId,
            roomId: roomId || data?.rooms.find((room) => room.id !== "quirofano")?.id || "sala-1",
            professional: professional || data?.professionals[0]?.name || "Recepción",
            notes: "Alta de recepción",
          }
        : null;
      return api.admitPatient({
        firstName,
        lastName,
        phone,
        email,
        source,
        kind,
        interest: activityId,
        visit,
      });
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      toast.success(result.created ? `${result.patient.fullName} dado de alta` : `${result.patient.fullName} ya estaba. Se completó la ficha`);
      onDone();
    },
    onError: (error: Error) => {
      void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      if (error.message === "consent") {
        toast.error("La ficha está. Quirófano pide el consentimiento firmado.");
        return;
      }
      if (error.message.startsWith("agenda:")) {
        toast.error(`La ficha está. La cita no cabe: ${error.message.slice(8)}`);
        return;
      }
      toast.error(error.message || "No se pudo dar de alta");
    },
  });

  const data = catalog.data;
  const activityId = interest || data?.activities[0]?.id || "";

  return (
    <form
      className="grid gap-3 rounded-xl bg-surface p-4 shadow-border"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <div>
        <p className="label-kicker">Alta</p>
        <h2 className="font-display text-xl font-medium text-ink">Cliente de esta clínica</h2>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setKind("posible")} className={`h-10 rounded-full px-3 text-sm font-medium ${kind === "posible" ? "bg-accent text-accent-fg" : "bg-bg text-ink-muted"}`}>
          Posible cliente
        </button>
        <button type="button" onClick={() => setKind("cliente")} className={`h-10 rounded-full px-3 text-sm font-medium ${kind === "cliente" ? "bg-accent text-accent-fg" : "bg-bg text-ink-muted"}`}>
          Cliente
        </button>
      </div>
      <label className="text-sm text-ink-muted">
        Nombre
        <Input className="mt-1" value={firstName} onChange={(event) => setFirstName(event.target.value)} required autoComplete="given-name" />
      </label>
      <label className="text-sm text-ink-muted">
        Apellidos
        <Input className="mt-1" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" />
      </label>
      <label className="text-sm text-ink-muted">
        Teléfono
        <Input className="mt-1" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" />
      </label>
      <label className="text-sm text-ink-muted">
        Correo
        <Input className="mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
      </label>
      <label className="text-sm text-ink-muted">
        Origen
        <select aria-label="Origen" value={source} onChange={(event) => setSource(event.target.value as LeadSource)} className="mt-1 h-11 w-full rounded-md bg-bg px-3 text-sm text-ink">
          {SOURCES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="text-sm text-ink-muted">
        Interés
        <select aria-label="Interés" value={activityId} onChange={(event) => setInterest(event.target.value)} className="mt-1 h-11 w-full rounded-md bg-bg px-3 text-sm text-ink">
          {(data?.activities ?? []).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={withVisit} onChange={(event) => setWithVisit(event.target.checked)} />
        Poner cita en la agenda
      </label>
      {withVisit ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input aria-label="Día de la cita" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          <Input aria-label="Hora de la cita" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          <select aria-label="Sala" value={roomId} onChange={(event) => setRoomId(event.target.value)} className="h-11 rounded-md bg-bg px-3 text-sm text-ink">
            {(data?.rooms ?? []).map((room) => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
          <select aria-label="Profesional" value={professional || data?.professionals[0]?.name || ""} onChange={(event) => setProfessional(event.target.value)} className="h-11 rounded-md bg-bg px-3 text-sm text-ink">
            {(data?.professionals ?? []).map((person) => (
              <option key={person.id} value={person.name}>{person.name}</option>
            ))}
          </select>
        </div>
      ) : null}
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Guardando…" : "Dar de alta"}
      </Button>
    </form>
  );
}
