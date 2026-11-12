import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { api, PIPELINE_STAGES, type Patient, type PipelineStage } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui";
import { stageMeta } from "@/lib/api/types";
import { formatMoney } from "@/lib/utils";
import { KanbanColumn } from "./column";
import { KanbanSkeleton } from "./skeleton";
import { applyBoardFilters, FilterField, type BoardFilter } from "./filters";
import { AdmitButton, EditPatientButton } from "@/components/clinic/admit";

type BoardView = "columnas" | "lista" | "origen" | "profesional";

const VIEWS: { id: BoardView; label: string }[] = [
  { id: "columnas", label: "Columnas" },
  { id: "lista", label: "Lista" },
  { id: "origen", label: "Por origen" },
  { id: "profesional", label: "Por profesional" },
];

export function KanbanBoard() {
  const search = useUiStore((state) => state.search);
  const queryClient = useQueryClient();
  const [view, setView] = useState<BoardView>("columnas");
  const [filters, setFilters] = useState<BoardFilter[]>([]);

  const pipelineQuery = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => api.listPipeline(),
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
    },
  });

  const loading = pipelineQuery.isPending;
  const source = pipelineQuery.data ?? [];
  const patients = applyBoardFilters(source, filters, search);
  const stageFilter = filters.some((filter) => filter.kind === "etapa");
  const move = (id: string, next: PipelineStage) => {
    if (source.find((item) => item.id === id)?.stage === next) return;
    moveMutation.mutate({ id, stage: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <AdmitButton />
      <div className="flex gap-2 overflow-x-auto">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={`h-10 shrink-0 rounded-full px-3 text-sm font-medium ${view === item.id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? null : (
        <FilterField patients={source} filters={filters} onChange={setFilters} />
      )}

      <p className="text-xs text-ink-muted">
        {loading ? "Cargando fichas" : `${patients.length} de ${source.length} fichas`}
        {filters.length > 1 ? " · los filtros se combinan" : ""}
      </p>


      {loading ? (
        <KanbanSkeleton />
      ) : view === "columnas" ? (
        <div className="kanban-scroller">
          {PIPELINE_STAGES.filter((stage) => !stageFilter || patients.some((patient) => patient.stage === stage.id)).map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage.id}
              patients={patients.filter((patient) => patient.stage === stage.id)}
              onMove={move}
            />
          ))}
        </div>
      ) : view === "lista" ? (
        <BoardList patients={patients} onMove={move} />
      ) : (
        <GroupedBoard
          groups={groupPatients(patients, view === "origen" ? (patient) => patient.source : (patient) => patient.assignedTo)}
          onMove={move}
        />
      )}
    </div>
  );
}

function BoardList({ patients, onMove }: { patients: Patient[]; onMove: (id: string, stage: PipelineStage) => void }) {
  if (patients.length === 0) return <EmptyBoard />;
  return (
    <ul className="flex flex-col gap-2">
      {patients.map((patient) => (
        <li key={patient.id} className="rounded-xl bg-surface px-3 py-2 shadow-border">
          <div className="flex items-center gap-2">
          <Link to="/pacientes/$id" params={{ id: patient.id }} className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{patient.fullName}</span>
            <span className="block truncate text-xs text-ink-muted">
              {stageMeta(patient.stage).label} · {patient.treatmentInterest} · {patient.assignedTo}
            </span>
          </Link>
          <span className="shrink-0 text-sm tabular-nums text-ink">{formatMoney(patient.estimatedValue)}</span>
          <StageSelect patient={patient} onMove={onMove} />
          </div>
          <EditPatientButton patient={patient} />
        </li>
      ))}
    </ul>
  );
}

function GroupedBoard({
  groups,
  onMove,
}: {
  groups: { key: string; patients: Patient[] }[];
  onMove: (id: string, stage: PipelineStage) => void;
}) {
  if (groups.length === 0) return <EmptyBoard />;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="text-sm font-medium text-ink">
            {group.key} <span className="font-normal text-ink-muted">{group.patients.length}</span>
          </h2>
          <div className="mt-2">
            <BoardList patients={group.patients} onMove={onMove} />
          </div>
        </section>
      ))}
    </div>
  );
}

function StageSelect({ patient, onMove }: { patient: Patient; onMove: (id: string, stage: PipelineStage) => void }) {
  return (
    <select
      aria-label={`Mover a ${patient.fullName}`}
      value={patient.stage}
      onChange={(event) => onMove(patient.id, event.target.value as PipelineStage)}
      className="h-9 max-w-28 shrink-0 rounded-md bg-bg px-2 text-xs text-ink"
    >
      {PIPELINE_STAGES.map((stage) => (
        <option key={stage.id} value={stage.id}>
          {stage.label}
        </option>
      ))}
    </select>
  );
}

function EmptyBoard() {
  return <p className="rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border">Ninguna ficha con esos filtros.</p>;
}

function groupPatients(patients: Patient[], keyOf: (patient: Patient) => string) {
  const map = new Map<string, Patient[]>();
  for (const patient of patients) {
    const key = keyOf(patient) || "Sin asignar";
    map.set(key, [...(map.get(key) ?? []), patient]);
  }
  return [...map.entries()]
    .map(([key, list]) => ({ key, patients: list }))
    .sort((a, b) => b.patients.length - a.patients.length);
}
