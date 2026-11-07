import { PIPELINE_STAGES } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function KanbanSkeleton() {
  return (
    <div className="kanban-scroller">
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.id} className="kanban-column">
          <div className="rounded-xl bg-bg-elevated p-2">
            <div className="px-2 pb-3 pt-1">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-surface p-3 shadow-border"
                >
                  <div className="flex gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="mt-3 h-5 w-20" />
                  <Skeleton className="mt-3 h-2.5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
