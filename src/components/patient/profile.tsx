import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
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
              <Timeline events={timelineQuery.data ?? []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
