import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cake, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { api, type Patient } from "@/lib/api";
import { stageMeta } from "@/lib/api/types";
import { ageFrom, economics, nextBirthday } from "@/lib/economics";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/utils";

const STAGE_TONE = {
  new: "muted",
  qualified: "accent",
  proposal: "warning",
  confirmed: "ink",
  followup: "voice",
  invoiced: "success",
  lost: "warning",
} as const;

export function ContactPanel({ patient }: { patient: Patient }) {
  const stage = stageMeta(patient.stage);
  const money = economics(patient);
  const birthday = patient.birthday ? nextBirthday(patient.birthday) : null;

  return (
    <aside className="rounded-xl bg-surface p-5 shadow-border lg:sticky lg:top-24">
      <div className="flex items-start gap-4">
        <Avatar name={patient.fullName} size="lg" />
        <div className="min-w-0">
          <p className="label-kicker">Ficha 360</p>
          <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
            {patient.fullName}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{patient.treatmentInterest}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={STAGE_TONE[patient.stage]}>{stage.label}</Badge>
        {patient.billed ? <Badge tone="success">Cobrado</Badge> : null}
        {patient.aiScore ? <Badge tone="accent">IA {patient.aiScore}</Badge> : null}
        {patient.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <Row icon={Phone} label="Teléfono" value={patient.phone} />
        <Row icon={Mail} label="Email" value={patient.email} />
        <Row icon={MapPin} label="Ciudad" value={`${patient.city} · ${patient.clinic}`} />
        <Row icon={UserRound} label="Responsable" value={patient.assignedTo} />
        {patient.birthday ? (
          <Row
            icon={Cake}
            label="Cumpleaños"
            value={
              birthday
                ? `${new Date(patient.birthday).toLocaleDateString("es-ES", { day: "numeric", month: "long" })} · ${ageFrom(patient.birthday)} años`
                : patient.birthday
            }
          />
        ) : null}
      </dl>

      <Separator className="my-5" />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Total" value={formatMoney(money.total)} />
        <Stat label="Cobrado" value={formatMoney(money.collected)} />
        <Stat label="Pendiente" value={formatMoney(money.pending)} />
      </div>

      <Separator className="my-5" />

      <div>
        <p className="label-kicker">Notas clínicas</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{patient.notes}</p>
      </div>

      {patient.lostReason ? (
        <div className="mt-5 rounded-lg bg-bg px-4 py-3">
          <p className="label-kicker">No insistir</p>
          <p className="mt-1 text-sm text-ink">{patient.lostReason}</p>
        </div>
      ) : (
        <LostForm patientId={patient.id} />
      )}

      <ClinicalBlock patient={patient} />

      {patient.nextAction ? (
        <div className="mt-5 rounded-lg bg-accent-soft px-4 py-3">
          <p className="label-kicker text-accent">Siguiente acción</p>
          <p className="mt-1 text-sm font-medium text-accent">{patient.nextAction}</p>
        </div>
      ) : null}
    </aside>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 text-ink-subtle" />
      <div>
        <dt className="text-xs text-ink-subtle">{label}</dt>
        <dd className="text-ink">{value}</dd>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-subtle">{label}</p>
      <p className="mt-0.5 font-display text-lg font-medium tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function ClinicalBlock({ patient }: { patient: Patient }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState(patient.contraindications ?? "");
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["patient", patient.id] });
    void queryClient.invalidateQueries({ queryKey: ["timeline", patient.id] });
  };
  const save = useMutation({
    mutationFn: () => api.setContraindications(patient.id, text),
    onSuccess: () => {
      refresh();
      toast.success("Contraindicaciones guardadas");
    },
  });
  const sign = useMutation({
    mutationFn: () => api.signConsent(patient.id),
    onSuccess: () => {
      refresh();
      toast.success("Consentimiento marcado en recepción");
    },
  });
  const [link, setLink] = useState("");
  const portal = useMutation({
    mutationFn: () => api.ensurePortal(patient.id),
    onSuccess: async (token) => {
      if (!token) return;
      const url = `${window.location.origin}/p/${token}`;
      setLink(url);
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace del paciente copiado");
      } catch {
        toast.message("Copie el enlace de la ficha");
      }
    },
  });

  return (
    <div className="mt-5">
      <p className="label-kicker">Seguridad</p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        aria-label="Contraindicaciones"
        placeholder="Alergias, medicación, lo que impide tratar"
        className="mt-2 w-full rounded-md bg-bg px-3 py-2 text-sm text-ink shadow-border outline-none"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={save.isPending} onClick={() => save.mutate()}>
          Guardar
        </Button>
        <Button size="sm" variant="secondary" disabled={portal.isPending} onClick={() => portal.mutate()}>
          Enlace para el móvil
        </Button>
        {patient.consentSigned ? (
          <Badge tone="success">Consentimiento firmado</Badge>
        ) : (
          <Button size="sm" disabled={sign.isPending} onClick={() => sign.mutate()}>
            Marcar firmado aquí
          </Button>
        )}
      </div>
      {patient.consentSignature ? (
        <img src={patient.consentSignature} alt="Firma del consentimiento" className="mt-3 h-16 max-w-full rounded-md bg-[#fffdf8] shadow-border" />
      ) : null}
      {link ? (
        <p className="mt-2 break-all text-xs text-ink-muted">{link}</p>
      ) : null}
      {patient.consentSigned ? null : (
        <p className="mt-2 text-xs text-ink-muted">Sin firma no se programa quirófano.</p>
      )}
    </div>
  );
}

function LostForm({ patientId }: { patientId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const save = useMutation({
    mutationFn: () => api.markLost(patientId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      void queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast.success("No se le volverá a escribir");
    },
  });
  if (!open) {
    return (
      <Button className="mt-5" variant="ghost" onClick={() => setOpen(true)}>
        Dar por perdido
      </Button>
    );
  }
  return (
    <form
      className="mt-5 flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!reason.trim()) return;
        save.mutate();
      }}
    >
      <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo. No se insiste." aria-label="Motivo de pérdida" required />
      <Button type="submit" variant="outline" disabled={save.isPending}>Confirmar pérdida</Button>
    </form>
  );
}
