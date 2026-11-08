import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { api } from "@/lib/api";
import { buildKpis, moneyShare, periodRange, previousRange, trendPercent, type PeriodId } from "@/lib/kpis";
import { formatMoney } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui";
import { Skeleton } from "@/components/ui/skeleton";

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "7 días" },
  { id: "mes", label: "Mes" },
  { id: "fechas", label: "Fechas" },
];

export function Dashboard() {
  const role = useUiStore((state) => state.role);
  const pipeline = useQuery({ queryKey: ["pipeline"], queryFn: () => api.listPipeline() });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const [period, setPeriod] = useState<PeriodId>("semana");
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date(Date.now() + 6 * 86_400_000).toISOString().slice(0, 10));
  const [open, setOpen] = useState<string | null>("rentabilidad");

  if (role !== "direccion") {
    return (
      <p className="rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border">
        El cuadro de mandos es de dirección. Recepción y consulta trabajan desde la agenda.
      </p>
    );
  }

  if (pipeline.isPending || catalog.isPending || !pipeline.data || !catalog.data) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const range = periodRange(period, new Date(from), new Date(to));
  const previous = previousRange(range.start, range.end);
  const kpi = buildKpis(pipeline.data, catalog.data, range.start, range.end);
  const before = buildKpis(pipeline.data, catalog.data, previous.start, previous.end);
  const margin = kpi.income - kpi.cost;
  const marginBefore = before.income - before.cost;
  const occupation = kpi.capacity ? Math.round((kpi.booked / kpi.capacity) * 100) : 0;
  const people = pipeline.data.filter((patient) => patient.stage !== "lost");
  const closed = pipeline.data.filter((patient) => patient.stage === "invoiced" || patient.billed);
  const openPipeline = pipeline.data.filter((patient) => patient.stage !== "invoiced" && patient.stage !== "lost" && !patient.billed);
  const pipelineValue = openPipeline.reduce((sum, patient) => sum + patient.estimatedValue, 0);
  const closedValue = closed.reduce((sum, patient) => sum + patient.estimatedValue, 0);
  const newClients = pipeline.data.filter((patient) => inRange(patient.createdAt, range.start, range.end)).length;
  const newClientsBefore = pipeline.data.filter((patient) => inRange(patient.createdAt, previous.start, previous.end)).length;
  const visits = kpi.treatments.reduce((sum, item) => sum + item.count, 0);
  const ticket = visits ? Math.round(kpi.income / visits) : 0;
  const conversion = pipeline.data.length ? Math.round((closed.length / pipeline.data.length) * 100) : 0;
  const maxIncome = kpi.treatments[0]?.income ?? 1;
  const margins = [...kpi.treatments].sort((a, b) => b.income - b.cost - (a.income - a.cost));
  const maxMargin = Math.max(...margins.map((item) => Math.abs(item.income - item.cost)), 1);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-kicker">Cuadro de mandos</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Control de la clínica</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Pulse un indicador para ver de qué clientes, citas y tratamientos sale.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {PERIODS.map((item) => (
          <button key={item.id} type="button" onClick={() => setPeriod(item.id)} className={`h-10 shrink-0 rounded-full px-3 text-sm font-medium ${period === item.id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`}>
            {item.label}
          </button>
        ))}
      </div>
      {period === "fechas" ? (
        <div className="grid grid-cols-2 gap-2">
          <input type="date" aria-label="Desde" value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 rounded-md bg-surface px-3 text-sm shadow-border" />
          <input type="date" aria-label="Hasta" value={to} onChange={(event) => setTo(event.target.value)} className="h-11 rounded-md bg-surface px-3 text-sm shadow-border" />
        </div>
      ) : (
        <p className="text-xs text-ink-subtle">{format(range.start, "d MMM", { locale: es })} – {format(new Date(range.end.getTime() - 1), "d MMM", { locale: es })}</p>
      )}

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-xl bg-surface px-4 py-4 shadow-border">
          <p className="text-xs font-medium tracking-wide text-ink-subtle">Número de clientes</p>
          <p className="mt-1 font-display text-4xl font-medium tracking-tight tabular-nums text-ink">{people.length}</p>
          <p className="mt-1 text-xs text-ink-muted">{newClients} nuevos en el periodo. {trendLabel(newClients, newClientsBefore)}</p>
        </article>
        <article className="rounded-xl bg-surface px-4 py-4 shadow-border">
          <p className="text-xs font-medium tracking-wide text-ink-subtle">Tendencia de ingreso</p>
          <p className="mt-1 font-display text-4xl font-medium tracking-tight tabular-nums text-ink">{signed(trendPercent(kpi.income, before.income))}</p>
          <p className="mt-1 text-xs text-ink-muted">{formatMoney(kpi.income)} frente a {formatMoney(before.income)}</p>
        </article>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Tile id="clientes" open={open} setOpen={setOpen} label="Con cita" value={String(kpi.clients.length)} hint={trendLabel(kpi.clients.length, before.clients.length)} />
        <Tile id="ausencias" open={open} setOpen={setOpen} label="No asistencias" value={String(kpi.absences.length)} hint={trendLabel(kpi.absences.length, before.absences.length)} />
        <Tile id="cerrado" open={open} setOpen={setOpen} label="Cerrado" value={String(closed.length)} hint={`${formatMoney(closedValue)} · ${conversion}% conversión`} />
        <Tile id="pipeline" open={open} setOpen={setOpen} label="Pipeline abierto" value={formatMoney(pipelineValue)} hint={`${openPipeline.length} fichas vivas`} />
        <Tile id="ingresos" open={open} setOpen={setOpen} label="Ingreso" value={formatMoney(kpi.income)} hint={trendLabel(kpi.income, before.income)} />
        <Tile id="cobrado" open={open} setOpen={setOpen} label="Cobrado" value={formatMoney(kpi.collected)} hint={trendLabel(kpi.collected, before.collected)} />
        <Tile id="pendiente" open={open} setOpen={setOpen} label="Pendiente" value={formatMoney(kpi.pending)} hint={trendLabel(kpi.pending, before.pending)} />
        <Tile id="ticket" open={open} setOpen={setOpen} label="Ticket medio" value={formatMoney(ticket)} hint={visits ? `${visits} citas atendidas` : "Sin citas"} />
        <Tile id="tratamientos" open={open} setOpen={setOpen} label="Tratamientos" value={String(kpi.treatments.length)} hint="Tipos con actividad" />
        <Tile id="rentabilidad" open={open} setOpen={setOpen} label="Rentabilidad" value={formatMoney(margin)} hint={trendLabel(margin, marginBefore)} />
        <Tile id="ocupacion" open={open} setOpen={setOpen} label="Ocupación" value={`${occupation}%`} hint={`${kpi.booked} min de ${kpi.capacity}`} />
      </div>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Gráfico de tratamientos</p>
        {kpi.treatments.length === 0 ? <p className="mt-3 text-sm text-ink-muted">Sin tratamientos en el periodo.</p> : (
          <Bars rows={kpi.treatments.map((item) => ({ id: item.id, label: `${item.code} ${item.name}`, value: item.income, max: maxIncome, color: item.color, caption: `${formatMoney(item.income)} · ${item.count}` }))} />
        )}
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Rentabilidad por tratamiento</p>
        {margins.length === 0 ? <p className="mt-3 text-sm text-ink-muted">Sin margen que calcular.</p> : (
          <Bars rows={margins.map((item) => ({ id: item.id, label: item.name, value: Math.abs(item.income - item.cost), max: maxMargin, color: item.color, caption: formatMoney(item.income - item.cost) }))} />
        )}
      </section>

      {open === "clientes" ? <Panel title="Clientes">{kpi.clients.length === 0 ? <Empty /> : kpi.clients.map((item) => <Row key={item.id} label={item.name} value={`${item.visits} citas`} href={`/pacientes/${item.id}`} />)}</Panel> : null}
      {open === "ausencias" ? <Panel title="No asistencias">{kpi.absences.length === 0 ? <Empty /> : kpi.absences.map((item) => <Row key={item.id} label={item.name} value={item.activity} />)}</Panel> : null}
      {open === "ingresos" ? <Panel title="Ingresos por tratamiento">{kpi.treatments.length === 0 ? <Empty /> : kpi.treatments.map((item) => <Row key={item.id} label={`${item.code} ${item.name}`} value={formatMoney(item.income)} swatch={item.color} />)}</Panel> : null}
      {open === "cobrado" ? <Panel title="Cobrado">{kpi.collectedRows.length === 0 ? <Empty /> : kpi.collectedRows.map((item, index) => <Row key={index} label={item.name} value={formatMoney(item.amount)} hint={item.concept} />)}</Panel> : null}
      {open === "pendiente" ? <Panel title="Pendiente">{kpi.pendingRows.length === 0 ? <Empty /> : kpi.pendingRows.map((item, index) => <Row key={index} label={item.name} value={formatMoney(item.amount)} hint={item.concept} />)}</Panel> : null}
      {open === "tratamientos" ? <Panel title="Tipos de tratamiento">{kpi.treatments.map((item) => <Row key={item.id} label={`${item.code} ${item.name}`} value={`${item.count} · ${moneyShare(item.income, kpi.income)}%`} swatch={item.color} />)}</Panel> : null}
      {open === "rentabilidad" ? (
        <Panel title="Rentabilidad">
          <Row label="Ingresos" value={formatMoney(kpi.income)} />
          <Row label="Costes" value={formatMoney(kpi.cost)} />
          <Row label="Margen" value={`${formatMoney(margin)} · ${moneyShare(margin, kpi.income)}%`} />
          {kpi.treatments.map((item) => <Row key={item.id} label={item.name} value={formatMoney(item.income - item.cost)} swatch={item.color} />)}
        </Panel>
      ) : null}
      {open === "cerrado" ? <Panel title="Cerrado">{closed.length === 0 ? <Empty /> : closed.map((patient) => <Row key={patient.id} label={patient.fullName} value={formatMoney(patient.estimatedValue)} href={`/pacientes/${patient.id}`} />)}</Panel> : null}
      {open === "pipeline" ? <Panel title="Pipeline abierto">{openPipeline.map((patient) => <Row key={patient.id} label={patient.fullName} value={formatMoney(patient.estimatedValue)} hint={patient.treatmentInterest} href={`/pacientes/${patient.id}`} />)}</Panel> : null}
      {open === "ticket" ? <Panel title="Ticket medio"><Row label="Ingreso del periodo" value={formatMoney(kpi.income)} /><Row label="Citas atendidas" value={String(visits)} /><Row label="Ticket" value={formatMoney(ticket)} /></Panel> : null}
      {open === "ocupacion" ? <Panel title="Ocupación sobre el total"><Row label="Minutos reservados" value={String(kpi.booked)} /><Row label="Capacidad de salas" value={String(kpi.capacity)} /><Row label="Porcentaje" value={`${occupation}%`} /></Panel> : null}
    </div>
  );
}

function Tile({ id, open, setOpen, label, value, hint }: { id: string; open: string | null; setOpen: (id: string | null) => void; label: string; value: string; hint: string }) {
  const active = open === id;
  return (
    <button type="button" onClick={() => setOpen(active ? null : id)} className={`rounded-xl px-4 py-3 text-left shadow-border ${active ? "bg-accent text-accent-fg" : "bg-surface"}`}>
      <span className={`block text-xs font-medium tracking-wide ${active ? "text-accent-fg/80" : "text-ink-subtle"}`}>{label}</span>
      <span className="mt-1 block font-display text-2xl font-medium tracking-tight tabular-nums">{value}</span>
      <span className={`mt-1 block text-xs ${active ? "text-accent-fg/80" : "text-ink-muted"}`}>{hint}</span>
    </button>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-surface p-4 shadow-border">
      <p className="label-kicker">{title}</p>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Row({ label, value, hint, swatch, href }: { label: string; value: string; hint?: string; swatch?: string; href?: string }) {
  const body = (
    <span className="flex items-center justify-between gap-3 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        {swatch ? <span className="size-2.5 shrink-0 rounded-full" style={{ background: swatch }} /> : null}
        <span className="truncate text-ink">{label}{hint ? <span className="block text-xs text-ink-muted">{hint}</span> : null}</span>
      </span>
      <span className="shrink-0 tabular-nums text-ink">{value}</span>
    </span>
  );
  if (!href) return body;
  return <Link to="/pacientes/$id" params={{ id: href.replace("/pacientes/", "") }}>{body}</Link>;
}

function Empty() {
  return <p className="text-sm text-ink-muted">Nada en este periodo.</p>;
}

function Bars({ rows }: { rows: { id: string; label: string; value: number; max: number; color: string; caption: string }[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.id}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-ink">
              <span className="size-2 shrink-0 rounded-full" style={{ background: row.color }} />
              <span className="truncate">{row.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-ink-muted">{row.caption}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full" style={{ width: `${Math.max(6, Math.round((row.value / row.max) * 100))}%`, background: row.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function inRange(iso: string, start: Date, end: Date) {
  const time = new Date(iso).getTime();
  return time >= start.getTime() && time < end.getTime();
}

function signed(value: number) {
  if (value === 0) return "0%";
  return `${value > 0 ? "+" : "−"}${Math.abs(value)}%`;
}

function trendLabel(current: number, previous: number) {
  const value = trendPercent(current, previous);
  if (value === 0) return "Igual que el periodo anterior";
  return `${signed(value)} vs periodo anterior`;
}
