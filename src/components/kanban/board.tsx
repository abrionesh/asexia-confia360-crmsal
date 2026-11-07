import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, PIPELINE_STAGES, type Patient, type PipelineStage } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui";
import { stageMeta } from "@/lib/api/types";
import { KanbanColumn } from "./column";
import { KanbanSkeleton } from "./skeleton";
import { MetricsStrip } from "./metrics";
import { AlarmQueue } from "@/components/alarms/queue";

export function KanbanBoard() {
  const search = useUiStore((state) => state.search);
  const queryClient = useQueryClient();

  const pipelineQuery = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => api.listPipeline(),
  });
  const metricsQuery = useQuery({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) =>
      api.movePatient(id, stage),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["pipeline"] });
      const previous = queryClient.getQueryData<Patient[]>(["pipeline"]);
      queryClient.setQueryData<Patient[]>(["pipeline"], (current) =>
        (current ?? []).map((patient) =>
          patient.id === id ? { ...patient, stage } : patient,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["pipeline"], context.previous);
      }
      toast.error("No se pudo mover el lead");
    },
    onSuccess: (patient) => {
      toast.success(`${patient.fullName} · ${stageMeta(patient.stage).label}`);
      void queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });

  const term = search.trim().toLowerCase();
  const patients = (pipelineQuery.data ?? []).filter((patient) => {
    if (!term) return true;
    return (
      patient.fullName.toLowerCase().includes(term) ||
      patient.treatmentInterest.toLowerCase().includes(term) ||
      patient.assignedTo.toLowerCase().includes(term)
    );
  });

  const loading = pipelineQuery.isPending;

  return (
    <div className="flex flex-col gap-5">
      <MetricsStrip metrics={metricsQuery.data} loading={metricsQuery.isPending} />
      <AlarmQueue />

      {loading ? (
        <KanbanSkeleton />
      ) : (
        <div className="kanban-scroller">
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage.id}
              patients={patients.filter((patient) => patient.stage === stage.id)}
              onMove={(id, next) => {
                if (patients.find((item) => item.id === id)?.stage === next) return;
                moveMutation.mutate({ id, stage: next });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
