import { useState } from "react";
import type { Patient, PipelineStage } from "@/lib/api";
import { PIPELINE_STAGES } from "@/lib/api";
import { PatientCard } from "./card";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils";

export function KanbanColumn({
  stage,
  patients,
  onMove,
}: {
  stage: PipelineStage;
  patients: Patient[];
  onMove: (id: string, stage: PipelineStage) => void;
}) {
  const [over, setOver] = useState(false);
  const meta = PIPELINE_STAGES.find((item) => item.id === stage)!;
  const value = patients.reduce((sum, patient) => sum + patient.estimatedValue, 0);

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const id = event.dataTransfer.getData("text/patient-id");
        if (id) onMove(id, stage);
      }}
      className={cn(
        "kanban-column flex flex-col rounded-xl p-2 transition-[background-color,box-shadow] duration-fast ease-out-smooth",
        over ? "bg-accent-soft/70 shadow-border" : "bg-bg-elevated",
      )}
    >
      <header className="flex items-baseline justify-between gap-2 px-2 pb-3 pt-1">
        <div>
          <p className="label-kicker">{meta.hint}</p>
          <h2 className="text-sm font-medium text-ink">{meta.label}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs tabular-nums text-ink-muted">{patients.length}</p>
          <p className="text-2xs tabular-nums text-ink-subtle">
            {formatMoney(value)}
          </p>
        </div>
      </header>

      <div className="flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto px-0.5 pb-2">
        {patients.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-ink-subtle">
            Sin fichas en esta columna
          </p>
        ) : (
          patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onMove={onMove} />
          ))
        )}
      </div>
    </section>
  );
}
