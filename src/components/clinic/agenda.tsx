import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { api } from "@/lib/api";
import { addDays, allPayments, occupancy, sameDay, startOfDay } from "@/lib/occupancy";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUiStore } from "@/lib/store/ui";

const STATUS = { programada: "Programada", realizada: "Realizada", cancelada: "Cancelada" } as const;

export function Agenda() {
  const pipeline = useQuery({ queryKey: ["pipeline"], queryFn: () => api.listPipeline() });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const [offset, setOffset] = useState(0);
  const role = useUiStore((state) => state.role);
  const doctor = useUiStore((state) => state.doctor);
  const setDoctor = useUiStore((state) => state.setDoctor);
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, index) => addDays(today, index));
  const selected = days[offset] ?? today;

  if (pipeline.isPending || catalog.isPending || !pipeline.data || !catalog.data) {
    return <Skeleton className="h-40 rounded-xl" />;
  }

  const day = occupancy(pipeline.data, catalog.data, selected);
  const visible = role === "medico" ? day.visits.filter((visit) => visit.professional === doctor) : day.visits;
  const payments = allPayments(pipeline.data).filter((payment) => sameDay(payment.dueAt, selected));
  const hours = catalog.data.hours.find((item) => item.day === selected.getDay());

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-kicker">Agenda</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Citas y cobros</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {hours?.closed ? "Día cerrado." : `Abierto ${hours?.open}–${hours?.close}. ${catalog.data.rooms.length} salas.`}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((date, index) => {
          const active = index === offset;
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setOffset(index)}
              className={`h-16 min-w-16 shrink-0 rounded-xl px-3 text-left ${active ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`}
            >
              <span className="block text-2xs uppercase">{format(date, "EEE", { locale: es })}</span>
              <span className="font-display text-xl">{format(date, "d")}</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-ink-muted">
        Ocupación {day.closed ? "—" : `${Math.round(day.ratio * 100)}%`} · {day.booked} min reservados
        {role === "medico" ? ` · ${doctor}` : ""}
      </p>
      {role === "medico" ? (
        <div className="flex gap-2">
          {["Dra. Elena Marín", "Dr. Íñigo Salas"].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setDoctor(name)}
              className={`h-10 rounded-full px-3 text-xs font-medium ${doctor === name ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      <section className="flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-6 text-sm text-ink-muted shadow-border">Sin citas este día.</p>
        ) : (
          visible.map((visit) => (
            <article key={visit.id} className="rounded-xl bg-surface p-4 shadow-border">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={visit.status === "realizada" ? "success" : "ink"}>{STATUS[visit.status]}</Badge>
                <span className="text-xs text-ink-subtle">{format(new Date(visit.at), "HH:mm")}</span>
              </div>
              <Link to="/pacientes/$id" params={{ id: visit.patientId }} className="mt-2 block text-sm font-medium text-ink">
                {visit.patientName}
              </Link>
              <p className="mt-1 text-sm text-ink">{visit.activityName}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {visit.roomName} · {visit.durationMin} min · {visit.professional}
              </p>
              <p className="mt-1 text-sm tabular-nums text-ink">{formatMoney(visit.price)}</p>
              {visit.notes ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{visit.notes}</p> : null}
            </article>
          ))
        )}
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Pagos del día</p>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">No hay cobros previstos.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  <Link to="/pacientes/$id" params={{ id: payment.patientId }} className="font-medium text-ink">
                    {payment.patientName}
                  </Link>
                  <span className="block text-ink-muted">{payment.concept} · {payment.status}</span>
                </span>
                <span className="tabular-nums text-ink">{formatMoney(payment.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
