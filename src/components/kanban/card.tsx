import { useNavigate } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Patient, PipelineStage } from "@/lib/api";
import { PIPELINE_STAGES } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMoney } from "@/lib/utils";

export function PatientCard({
  patient,
  onMove,
}: {
  patient: Patient;
  onMove: (id: string, stage: PipelineStage) => void;
}) {
  const navigate = useNavigate();
  const dragging = useRef(false);
  const ago = formatDistanceToNow(new Date(patient.lastActivityAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <article
      draggable
      onDragStart={(event) => {
        dragging.current = true;
        event.dataTransfer.setData("text/patient-id", patient.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        window.setTimeout(() => {
          dragging.current = false;
        }, 0);
      }}
      onClick={() => {
        if (dragging.current) return;
        void navigate({ to: "/pacientes/$id", params: { id: patient.id } });
      }}
      className="group cursor-pointer rounded-lg bg-surface p-3 shadow-border transition-[box-shadow,transform] duration-quick ease-out-smooth hover:shadow-border-hover active:scale-99"
    >
      <div className="flex items-start gap-3">
        <Avatar name={patient.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-medium text-ink">
              {patient.fullName}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Mover a ${patient.fullName}`}
                  onClick={(event) => event.stopPropagation()}
                  className="flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-subtle opacity-100 transition-colors duration-quick hover:bg-bg hover:text-ink md:opacity-0 md:group-hover:opacity-100"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuLabel>Mover a</DropdownMenuLabel>
                {PIPELINE_STAGES.filter((stage) => stage.id !== patient.stage).map(
                  (stage) => (
                    <DropdownMenuItem
                      key={stage.id}
                      onSelect={() => onMove(patient.id, stage.id)}
                    >
                      {stage.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="truncate text-xs text-ink-muted">
            {patient.treatmentInterest}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="font-display text-base font-medium tabular-nums text-ink">
          {formatMoney(patient.estimatedValue)}
        </p>
        <div className="flex items-center gap-1.5">
          {patient.billed ? <Badge tone="success">Cobrado</Badge> : null}
          {patient.aiScore ? (
            <Badge tone="accent">IA {patient.aiScore}</Badge>
          ) : (
            <Badge>{patient.source}</Badge>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-2xs text-ink-subtle">
        <span className="truncate">{patient.assignedTo}</span>
        <span className="shrink-0">{ago}</span>
      </div>
    </article>
  );
}
