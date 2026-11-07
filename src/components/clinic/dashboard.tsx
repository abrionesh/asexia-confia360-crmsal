import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { api } from "@/lib/api";
import { economics } from "@/lib/economics";
import { addDays, occupancy, startOfDay } from "@/lib/occupancy";
import { formatMoney } from "@/lib/utils";
import { cashDay } from "@/lib/cash";
import { useUiStore } from "@/lib/store/ui";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const role = useUiStore((state) => state.role);
  const pipeline = useQuery({ queryKey: ["pipeline"], queryFn: () => api.listPipeline() });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const alarms = useQuery({ queryKey: ["alarms"], queryFn: () => api.listAlarms() });

  if (role !== "direccion") {
    return (
      <p className="rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border">
        El cuadro de mandos es de dirección. Recepción y consulta trabajan desde la agenda.
      </p>
    );
  }
  const loading = pipeline.isPending || catalog.isPending;

  if (loading || !pipeline.data || !catalog.data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const today = startOfDay(new Date());
  const todayOcc = occupancy(pipeline.data, catalog.data, today);
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(today, index);
    return { day, ...occupancy(pipeline.data, catalog.data, day) };
  });
  const money = pipeline.data.reduce(
    (sum, patient) => {
      const row = economics(patient);
      return {
        total: sum.total + row.total,
        collected: sum.collected + row.collected,
        pending: sum.pending + row.pending,
      };
    },
    { total: 0, collected: 0, pending: 0 },
  );
  const byActivity = new Map<string, number>();
  for (const patient of pipeline.data) {
    for (const visit of patient.visits ?? []) {
      if (visit.status === "cancelada") continue;
      byActivity.set(visit.activityName, (byActivity.get(visit.activityName) ?? 0) + 1);
    }
  }
  const mix = [...byActivity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxBooked = Math.max(...week.map((day) => day.booked), 1);
  const maxMix = mix[0]?.[1] ?? 1;
  const caja = cashDay(pipeline.data, today);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-kicker">Cuadro de mandos</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Control de la clínica</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Ocupación de salas, caja y lo que hay que avisar hoy.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Hoy en salas" value={todayOcc.closed ? "Cerrado" : `${todayOcc.booked} min`} hint={todayOcc.closed ? "Sin horario" : `${todayOcc.visits.length} citas · ${Math.round(todayOcc.ratio * 100)}% de la capacidad`} />
        <Tile label="Caja de hoy" value={formatMoney(caja.collected)} hint={`Previsto ${formatMoney(caja.expected)}`} />
        <Tile label="Citas hoy" value={String(todayOcc.visits.length)} hint={`${catalog.data.rooms.length} salas`} />
        <Tile label="Alarmas" value={String(alarms.data?.length ?? "…")} hint="Para actuar" />
      </div>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Próximos 7 días</p>
        <ul className="mt-4 flex flex-col gap-3">
          {week.map((day) => (
            <li key={day.day.toISOString()} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3">
              <span className="text-xs text-ink-muted">{format(day.day, "EEE d", { locale: es })}</span>
              <span className="h-2 overflow-hidden rounded-full bg-bg">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((day.booked / maxBooked) * 100)}%` }} />
              </span>
              <span className="text-xs tabular-nums text-ink-subtle">{day.closed ? "Cerrado" : `${day.booked} min`}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Actividad</p>
        <ul className="mt-4 flex flex-col gap-3">
          {mix.map(([name, count]) => (
            <li key={name} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <span>
                <span className="block text-sm text-ink">{name}</span>
                <span className="mt-1 block h-2 overflow-hidden rounded-full bg-bg">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((count / maxMix) * 100)}%` }} />
                </span>
              </span>
              <span className="text-xs tabular-nums text-ink-subtle">{count}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          Contrato {formatMoney(money.total)}. El pipeline comercial sigue en el{" "}
          <Link to="/" className="font-medium text-accent">tablero</Link>.
        </p>
      </section>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 shadow-border">
      <p className="text-xs font-medium tracking-wide text-ink-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
