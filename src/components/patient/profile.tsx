import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api, type Patient, type TimelineEvent } from "@/lib/api";
import { downloadPatientFile } from "@/lib/export-csv";
import { ContactPanel } from "./contact-panel";
import { PatientAlarms } from "@/components/alarms/queue";
import { ActionBar, FileCanvas } from "./record";
import { PatientSkeleton } from "./skeleton";
import { Timeline } from "./timeline";

export function PatientProfile({ id }: { id: string }) {
  const patientQuery = useQuery({
    queryKey: ["patient", id],
    queryFn: () => api.getPatient(id),
  });
  const timelineQuery = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => api.listTimeline(id),
  });

  const loading = patientQuery.isPending || timelineQuery.isPending;
  const patient = patientQuery.data;

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
      ) : (
        <div className="flex flex-col gap-5">
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
