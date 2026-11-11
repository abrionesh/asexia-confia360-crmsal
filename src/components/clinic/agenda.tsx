import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ClinicCatalog } from "@/lib/api/types";
import { addDays, allPayments, allVisits, occupancy, sameDay, startOfDay, type AgendaVisit } from "@/lib/occupancy";
import { formatMoney } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useUiStore } from "@/lib/store/ui";
import { AdmitButton } from "@/components/clinic/admit";

type ViewMode = "dia" | "semana" | "mes" | "fechas";

const STATUS = { programada: "Programada", realizada: "Realizada", cancelada: "Cancelada", ausente: "No asistió" } as const;

export function Agenda() {
  const pipeline = useQuery({ queryKey: ["pipeline"], queryFn: () => api.listPipeline() });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const role = useUiStore((state) => state.role);
  const doctor = useUiStore((state) => state.doctor);
  const setDoctor = useUiStore((state) => state.setDoctor);
  const [mode, setMode] = useState<ViewMode>("dia");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [rangeEnd, setRangeEnd] = useState(() => addDays(startOfDay(new Date()), 6));
  const [showHours, setShowHours] = useState(true);

  if (pipeline.isPending || catalog.isPending || !pipeline.data || !catalog.data) {
    return <Skeleton className="h-40 rounded-xl" />;
  }

  const data = catalog.data;
  const visits = allVisits(pipeline.data).filter((visit) => !doctor || visit.professional === doctor);
  const dayOcc = occupancy(pipeline.data, data, anchor);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="label-kicker">Agenda</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Citas y ocupación</h1>
      </div>
      <AdmitButton day={anchor} startWithVisit />

      <div className="flex gap-2 overflow-x-auto">
        {(
          [
            ["dia", "Día"],
            ["semana", "Semana"],
            ["mes", "Mes"],
            ["fechas", "Fechas"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMode(id)} className={`h-10 shrink-0 rounded-full px-3 text-sm font-medium ${mode === id ? "bg-accent text-accent-fg" : "bg-surface text-ink-muted shadow-border"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {role === "medico" ? null : (
          <button type="button" onClick={() => setDoctor("")} className={`h-9 shrink-0 rounded-full px-3 text-xs font-medium ${doctor === "" ? "bg-ink text-accent-fg" : "bg-surface text-ink shadow-border"}`}>
            Todos
          </button>
        )}
        {data.professionals.map((item) => (
          <button key={item.id} type="button" onClick={() => setDoctor(item.name)} className={`h-9 shrink-0 rounded-full px-3 text-xs font-medium ${doctor === item.name ? "text-white" : "bg-surface text-ink shadow-border"}`} style={doctor === item.name ? { background: item.color } : undefined}>
            {item.name}
          </button>
        ))}
      </div>

      <button type="button" onClick={() => setShowHours((value) => !value)} className="w-fit text-xs font-medium text-accent">
        {showHours ? "Ocultar horarios de atención" : "Ver horarios de atención"}
      </button>

      {mode === "dia" ? <DayView anchor={anchor} setAnchor={setAnchor} visits={visits} catalog={data} showHours={showHours} doctor={doctor} occupancyLabel={`${dayOcc.closed ? "Cerrado" : `${Math.round(dayOcc.ratio * 100)}% ocupación`} · ${dayOcc.booked} min`} payments={allPayments(pipeline.data).filter((payment) => sameDay(payment.dueAt, anchor))} /> : null}
      {mode === "semana" ? <WeekView anchor={anchor} setAnchor={setAnchor} visits={visits} catalog={data} showHours={showHours} doctor={doctor} /> : null}
      {mode === "mes" ? <MonthView anchor={anchor} setAnchor={setAnchor} onPickDay={(day) => { setAnchor(day); setMode("dia"); }} visits={visits} catalog={data} /> : null}
      {mode === "fechas" ? <RangeView anchor={anchor} setAnchor={setAnchor} rangeEnd={rangeEnd} setRangeEnd={setRangeEnd} visits={visits} catalog={data} showHours={showHours} doctor={doctor} /> : null}
      <Waitlist day={anchor} patients={pipeline.data} catalog={data} />
    </div>
  );
}

function Waitlist({ day, patients, catalog }: { day: Date; patients: { id: string; fullName: string }[]; catalog: ClinicCatalog }) {
  const queryClient = useQueryClient();
  const wait = useQuery({ queryKey: ["wait"], queryFn: () => api.listWait() });
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [activityId, setActivityId] = useState(catalog.activities[0]?.id ?? "");
  const [roomId, setRoomId] = useState(catalog.rooms[0]?.id ?? "");
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["wait"] });
    void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
  };
  const add = useMutation({
    mutationFn: () => api.addWait(patientId, activityId),
    onSuccess: () => {
      refresh();
      toast.success("En la lista de espera");
    },
  });
  const place = useMutation({
    mutationFn: (id: string) => api.placeWait(id, roomId, day.toISOString()),
    onSuccess: () => {
      refresh();
      toast.success("Colocado en el primer hueco del día");
    },
    onError: (error: Error) => toast.error(error.message.startsWith("agenda:") ? error.message.slice(8) : "No cabe en el día"),
  });
  const remove = useMutation({ mutationFn: (id: string) => api.removeWait(id), onSuccess: refresh });

  return (
    <section className="rounded-xl bg-surface p-4 shadow-border">
      <p className="label-kicker">Lista de espera</p>
      <h2 className="mt-1 font-display text-xl font-medium text-ink">Huecos del día</h2>
      <div className="mt-3 grid gap-2">
        <select aria-label="Paciente en espera" value={patientId} onChange={(event) => setPatientId(event.target.value)} className="h-11 rounded-md bg-bg px-3 text-sm">
          {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}
        </select>
        <select aria-label="Actividad en espera" value={activityId} onChange={(event) => setActivityId(event.target.value)} className="h-11 rounded-md bg-bg px-3 text-sm">
          {catalog.activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.name}</option>)}
        </select>
        <select aria-label="Sala para colocar" value={roomId} onChange={(event) => setRoomId(event.target.value)} className="h-11 rounded-md bg-bg px-3 text-sm">
          {catalog.rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </select>
        <button type="button" onClick={() => add.mutate()} className="h-11 rounded-md bg-accent text-sm font-medium text-accent-fg">Añadir a la espera</button>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {(wait.data ?? []).map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">{entry.patientName}</span>
              <span className="text-xs text-ink-muted">{entry.activityName}</span>
            </span>
            <span className="flex shrink-0 gap-2">
              <button type="button" className="text-xs font-medium text-accent" onClick={() => place.mutate(entry.id)}>Colocar</button>
              <button type="button" className="text-xs text-ink-muted" onClick={() => remove.mutate(entry.id)}>Quitar</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DayView({
  anchor,
  setAnchor,
  visits,
  catalog,
  showHours,
  doctor,
  occupancyLabel,
  payments,
}: {
  anchor: Date;
  setAnchor: (day: Date) => void;
  visits: AgendaVisit[];
  catalog: ClinicCatalog;
  showHours: boolean;
  doctor: string;
  occupancyLabel: string;
  payments: { id: string; patientId: string; patientName: string; concept: string; amount: number; status: string }[];
}) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(startOfDay(new Date()), index));
  const list = visits.filter((visit) => sameDay(visit.at, anchor)).sort((a, b) => +new Date(a.at) - +new Date(b.at));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto">
        {days.map((date) => {
          const active = sameDay(date.toISOString(), anchor);
          return (
            <button key={date.toISOString()} type="button" onClick={() => setAnchor(date)} className={`h-16 min-w-16 shrink-0 rounded-xl px-3 text-left ${active ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`}>
              <span className="block text-2xs uppercase">{format(date, "EEE", { locale: es })}</span>
              <span className="font-display text-xl">{format(date, "d")}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-ink-muted">{format(anchor, "EEEE d MMM", { locale: es })} · {occupancyLabel}</p>
      {showHours ? <Attention day={anchor} catalog={catalog} doctor={doctor} /> : null}
      {list.length === 0 ? <p className="rounded-xl bg-surface px-4 py-6 text-sm text-ink-muted shadow-border">Sin citas este día.</p> : list.map((visit) => <VisitCard key={visit.id} visit={visit} catalog={catalog} />)}
      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Pagos del día</p>
        {payments.length === 0 ? <p className="mt-2 text-sm text-ink-muted">No hay cobros previstos.</p> : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {payments.map((payment) => (
              <li key={payment.id} className="flex justify-between gap-3">
                <span><span className="block font-medium text-ink">{payment.patientName}</span><span className="text-ink-muted">{payment.concept} · {payment.status}</span></span>
                <span className="tabular-nums">{formatMoney(payment.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function WeekView({
  anchor,
  setAnchor,
  visits,
  catalog,
  showHours,
  doctor,
}: {
  anchor: Date;
  setAnchor: (day: Date) => void;
  visits: AgendaVisit[];
  catalog: ClinicCatalog;
  showHours: boolean;
  doctor: string;
}) {
  const monday = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  return (
    <div className="flex flex-col gap-3">
      <Pager label={format(monday, "d MMM", { locale: es }) + " – " + format(addDays(monday, 6), "d MMM", { locale: es })} onPrev={() => setAnchor(addDays(monday, -7))} onNext={() => setAnchor(addDays(monday, 7))} />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const list = visits.filter((visit) => sameDay(visit.at, day));
          return (
            <section key={day.toISOString()} className="w-56 shrink-0 rounded-xl bg-bg p-2">
              <h2 className="px-1 text-sm font-medium text-ink">{format(day, "EEE d", { locale: es })}</h2>
              {showHours ? <Attention day={day} catalog={catalog} doctor={doctor} compact /> : null}
              <div className="mt-2 flex flex-col gap-2">
                {list.map((visit) => <VisitCard key={visit.id} visit={visit} catalog={catalog} compact />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({
  anchor,
  setAnchor,
  onPickDay,
  visits,
  catalog,
}: {
  anchor: Date;
  setAnchor: (day: Date) => void;
  onPickDay: (day: Date) => void;
  visits: AgendaVisit[];
  catalog: ClinicCatalog;
}) {
  const cells = useMemo(() => monthCells(anchor), [anchor]);
  return (
    <div className="flex flex-col gap-3">
      <Pager label={format(anchor, "MMMM yyyy", { locale: es })} onPrev={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))} onNext={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))} />
      <div className="grid grid-cols-7 gap-1 text-center text-2xs text-ink-subtle">
        {["L", "M", "X", "J", "V", "S", "D"].map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <span key={`e-${index}`} />;
          const list = visits.filter((visit) => sameDay(visit.at, day));
          return (
            <button key={day.toISOString()} type="button" onClick={() => onPickDay(day)} className="min-h-16 rounded-lg bg-surface p-1 text-left shadow-border">
              <span className="text-xs text-ink">{day.getDate()}</span>
              <span className="mt-1 flex flex-wrap gap-1">
                {list.slice(0, 3).map((visit) => {
                  const activity = catalog.activities.find((item) => item.id === visit.activityId);
                  return <span key={visit.id} className="size-2 rounded-full" style={{ background: activity?.color ?? "#1C3D36" }} />;
                })}
              </span>
              {list.length > 0 ? <span className="mt-1 block text-2xs tabular-nums text-ink-subtle">{list.length}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RangeView({
  anchor,
  setAnchor,
  rangeEnd,
  setRangeEnd,
  visits,
  catalog,
  showHours,
  doctor,
}: {
  anchor: Date;
  setAnchor: (day: Date) => void;
  rangeEnd: Date;
  setRangeEnd: (day: Date) => void;
  visits: AgendaVisit[];
  catalog: ClinicCatalog;
  showHours: boolean;
  doctor: string;
}) {
  const start = anchor <= rangeEnd ? anchor : rangeEnd;
  const end = anchor <= rangeEnd ? rangeEnd : anchor;
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end && days.length < 62) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-ink-subtle">Desde
          <input type="date" className="mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border" value={toDateInput(anchor)} onChange={(event) => setAnchor(parseDateInput(event.target.value))} />
        </label>
        <label className="text-xs text-ink-subtle">Hasta
          <input type="date" className="mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border" value={toDateInput(rangeEnd)} onChange={(event) => setRangeEnd(parseDateInput(event.target.value))} />
        </label>
      </div>
      {days.map((day) => {
        const list = visits.filter((visit) => sameDay(visit.at, day));
        if (list.length === 0 && !showHours) return null;
        return (
          <section key={day.toISOString()}>
            <h2 className="text-sm font-medium text-ink">{format(day, "EEEE d MMM", { locale: es })}</h2>
            {showHours ? <Attention day={day} catalog={catalog} doctor={doctor} compact /> : null}
            <div className="mt-2 flex flex-col gap-2">
              {list.map((visit) => <VisitCard key={visit.id} visit={visit} catalog={catalog} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function VisitCard({ visit, catalog, compact }: { visit: AgendaVisit; catalog: ClinicCatalog; compact?: boolean }) {
  const activity = catalog.activities.find((item) => item.id === visit.activityId);
  const color = activity?.color ?? "#1C3D36";
  return (
    <Link to="/pacientes/$id" params={{ id: visit.patientId }} className="flex gap-2 rounded-lg bg-surface p-2 shadow-border">
      <span className="w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="min-w-0">
        <span className="text-xs font-medium tabular-nums" style={{ color }}>{activity?.code ?? ""} · {format(new Date(visit.at), "HH:mm")}</span>
        <span className="block truncate text-sm font-medium text-ink">{visit.patientName}</span>
        {compact ? null : (
          <span className="block text-xs text-ink-muted">{visit.activityName} · {visit.roomName} · {visit.durationMin} min · {STATUS[visit.status]}</span>
        )}
      </span>
    </Link>
  );
}

function Attention({ day, catalog, doctor, compact }: { day: Date; catalog: ClinicCatalog; doctor: string; compact?: boolean }) {
  const people = catalog.professionals.filter((item) => !doctor || item.name === doctor);
  const rows = people.flatMap((item) => {
    const hours = item.hours.find((row) => row.day === day.getDay());
    if (!hours || hours.closed) return [];
    return [{ ...item, open: hours.open, close: hours.close }];
  });
  if (rows.length === 0) return null;
  return (
    <ul className={`flex flex-col gap-1 ${compact ? "mt-1" : ""}`}>
      {rows.map((item) => (
        <li key={item.id} className="rounded-md px-2 py-1 text-xs text-ink" style={{ background: `${item.color}22` }}>
          Atención {compact ? item.name.split(" ").slice(-1) : item.name} {item.open}–{item.close}
        </li>
      ))}
    </ul>
  );
}

function Pager({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={onPrev} className="h-10 rounded-full bg-surface px-3 text-sm shadow-border">Anterior</button>
      <p className="text-sm font-medium capitalize text-ink">{label}</p>
      <button type="button" onClick={onNext} className="h-10 rounded-full bg-surface px-3 text-sm shadow-border">Siguiente</button>
    </div>
  );
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const delta = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - delta);
  return next;
}

function monthCells(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const pad = (first.getDay() + 6) % 7;
  const count = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: pad }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), day));
  return cells;
}

function toDateInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, (month ?? 1) - 1, day ?? 1));
}
