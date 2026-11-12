import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api, type Patient, type TimelineEvent } from "@/lib/api";
import { downloadPatientFile } from "@/lib/export-csv";
import { useUiStore } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
import { ContactPanel } from "./contact-panel";
import { PatientAlarms } from "@/components/alarms/queue";
import { ActionBar, FileCanvas } from "./record";
import { PatientSkeleton } from "./skeleton";
import { Timeline } from "./timeline";
import { FichaEditProvider, draftFrom, type FichaDraft } from "./ficha-edit";

export function PatientProfile({ id }: { id: string }) {
  const patientQuery = useQuery({
    queryKey: ["patient", id],
    queryFn: () => api.getPatient(id),
  });
  const timelineQuery = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => api.listTimeline(id),
  });
  const queryClient = useQueryClient();

  const loading = patientQuery.isPending || timelineQuery.isPending;
  const patient = patientQuery.data;
  const role = useUiStore((state) => state.role);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FichaDraft | null>(null);

  useEffect(() => {
    if (!patient) return;
    if (sessionStorage.getItem("asexia.editar") !== patient.id) return;
    sessionStorage.removeItem("asexia.editar");
    setDraft(draftFrom(patient));
    setEditing(true);
  }, [patient]);

  const save = useMutation({
    mutationFn: () => {
      if (!patient || !draft) throw new Error("No hay ficha.");
      return api.saveFicha(patient.id, {
        firstName: draft.firstName,
        lastName: draft.lastName,
        phone: draft.phone,
        email: draft.email,
        city: draft.city,
        birthday: draft.birthday,
        source: draft.source,
        treatmentInterest: draft.treatmentInterest,
        assignedTo: draft.assignedTo,
        estimatedValue: Number(draft.estimatedValue.replace(",", ".")),
        notes: draft.notes,
        contraindications: draft.contraindications,
        visits: Object.entries(draft.visitPrices).map(([id, price]) => ({ id, price: Number(price.replace(",", ".")) })),
        payments: Object.entries(draft.paymentAmounts).map(([id, amount]) => ({ id, amount: Number(amount.replace(",", ".")) })),
      });
    },
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ["patient", id] });
      void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      void queryClient.invalidateQueries({ queryKey: ["timeline", id] });
      setEditing(false);
      toast.success(`${saved.fullName} actualizado`);
    },
    onError: (error: Error) => toast.error(error.message || "No se pudo guardar"),
  });

  function openEdit(current: Patient) {
    setDraft(draftFrom(current));
    setEditing(true);
  }

  const body = !patient ? null : (
    <div className="flex flex-col gap-5">
      {editing && draft ? (
        <div className="sticky top-0 z-10 flex flex-wrap gap-2 rounded-xl bg-surface p-3 shadow-border">
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Guardando…" : "Guardar ficha"}
          </Button>
          <Button variant="ghost" onClick={() => setEditing(false)}>Cerrar</Button>
        </div>
      ) : role === "medico" ? null : (
        <Button variant="outline" className="w-fit" onClick={() => openEdit(patient)}>Editar</Button>
      )}
      <ActionBar patient={patient} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <ContactPanel patient={patient} />
        <div className="flex min-w-0 flex-col gap-5">
          <FileCanvas patient={patient} />
          <PatientAlarms patientId={patient.id} />
          <Timeline events={timelineQuery.data ?? []} patientId={patient.id} />
          <Privacy patientId={patient.id} patient={patient} timeline={timelineQuery.data ?? []} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/"
        className="inline-flex h-11 w-fit items-center gap-2 text-sm text-ink-muted transition-colors duration-quick hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Volver al pipeline
      </Link>

      {loading ? (
        <PatientSkeleton />
      ) : !patient ? (
        <div className="rounded-xl bg-surface px-5 py-10 text-center shadow-border">
          <p className="font-display text-xl text-ink">Paciente no encontrado</p>
          <p className="mt-2 text-sm text-ink-muted">
            El identificador no coincide con ninguna ficha del pipeline.
          </p>
        </div>
      ) : editing && draft ? (
        <FichaEditProvider
          draft={draft}
          setDraft={(value) => {
            setDraft((current) => {
              if (!current) return current;
              return typeof value === "function" ? value(current) : value;
            });
          }}
        >{body}</FichaEditProvider>
      ) : (
        body
      )}
    </div>
  );
}

function Privacy({ patientId, patient, timeline }: { patientId: string; patient: Patient; timeline: TimelineEvent[] }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.deletePatient(patientId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      toast.success("Ficha borrada de este libro");
      void navigate({ to: "/" });
    },
  });
  return (
    <section className="rounded-xl bg-surface p-4 shadow-border">
      <p className="label-kicker">Datos de la persona</p>
      <h2 className="mt-1 font-display text-xl font-medium text-ink">Sacar o borrar</h2>
      <p className="mt-2 text-sm text-ink-muted">La copia incluye la ficha y el historial. Borrar la quita del libro de la clínica.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="h-11 rounded-md bg-surface px-3 text-sm font-medium text-ink shadow-border" onClick={() => downloadPatientFile(patient, timeline)}>
          Descargar datos
        </button>
        <button
          type="button"
          className="h-11 rounded-md px-3 text-sm font-medium text-ink-muted"
          onClick={() => {
            if (window.confirm("¿Borrar esta ficha y su historial?")) remove.mutate();
          }}
        >
          Borrar ficha
        </button>
      </div>
    </section>
  );
}
