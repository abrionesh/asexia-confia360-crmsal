import { formatMoney } from "@/lib/utils";
import type { PipelineMetrics } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS = [
  { key: "pipelineValue", label: "Pipeline vivo", money: true },
  { key: "conversionRate", label: "Conversión", suffix: "%" },
  { key: "appointmentsThisWeek", label: "Citas confirmadas" },
  { key: "averageTicket", label: "Ticket medio", money: true },
] as const;

export function MetricsStrip({
  metrics,
  loading,
}: {
  metrics?: PipelineMetrics;
  loading: boolean;
}) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-xl bg-surface px-4 py-3 shadow-border"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map((item, index) => {
        const raw = metrics[item.key];
        const value =
          "money" in item && item.money
            ? formatMoney(raw)
            : "suffix" in item
              ? `${raw}${item.suffix}`
              : String(raw);
        return (
          <div
            key={item.key}
            className="enter-stagger rounded-xl bg-surface px-4 py-3 shadow-border"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <p className="text-xs font-medium tracking-wide text-ink-subtle">
              {item.label}
            </p>
            <p className="mt-1 font-display text-2xl font-medium tracking-tight text-ink tabular-nums">
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
