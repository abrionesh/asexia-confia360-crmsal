import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Activity, ActivityLink, ClinicCatalog, OpeningDay, Professional } from "@/lib/api/types";
import { ACTIVITY_COLORS, blankActivity, blankProfessional } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RecordDialog } from "./record-dialog";
import { Attachments } from "@/components/files/attachments";
import { ClinicDesk } from "@/components/clinic/desk";

export function Admin() {
  const role = useUiStore((state) => state.role);
  const setDoctor = useUiStore((state) => state.setDoctor);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const catalogQuery = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const [draft, setDraft] = useState<ClinicCatalog | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);

  useEffect(() => {
    if (catalogQuery.data && !draft) setDraft(structuredClone(catalogQuery.data));
  }, [catalogQuery.data, draft]);

  const save = useMutation({
    mutationFn: (next: ClinicCatalog) => api.saveCatalog(next),
    onSuccess: (saved) => {
      setDraft(structuredClone(saved));
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Catálogo guardado");
    },
  });

  if (role !== "direccion") {
    return (
      <p className="rounded-xl bg-surface px-4 py-8 text-sm text-ink-muted shadow-border">
        El catálogo lo mantiene dirección.
      </p>
    );
  }

  if (!draft) return <Skeleton className="h-40 rounded-xl" />;

  function commit(next: ClinicCatalog) {
    setDraft(next);
    save.mutate(next);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-kicker">Administración</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Catálogo de la clínica</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Cada actividad y cada profesional tienen su ficha. El precio, el coste y el color alimentan la agenda y la rentabilidad.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <p className="label-kicker">Actividades</p>
          <Button variant="outline" size="sm" onClick={() => setActivity(blankActivity(draft.activities.length))}>
            Nueva
          </Button>
        </div>
        {draft.activities.map((item) => {
          const margin = item.price - item.cost;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivity(structuredClone(item))}
              className="flex items-center gap-3 rounded-xl bg-surface px-3 py-3 text-left shadow-border"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-medium text-white" style={{ background: item.color }}>
                {item.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{item.name}</span>
                <span className="block truncate text-xs text-ink-muted">{item.sector} · {item.subsector}</span>
              </span>
              <span className="text-right text-xs">
                <span className="block tabular-nums text-ink">{formatMoney(item.price)}</span>
                <span className="block tabular-nums text-ink-subtle">Coste {formatMoney(item.cost)} · {item.price ? Math.round((margin / item.price) * 100) : 0}%</span>
              </span>
            </button>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <p className="label-kicker">Profesionales</p>
          <Button variant="outline" size="sm" onClick={() => setProfessional(blankProfessional())}>
            Nuevo
          </Button>
        </div>
        {draft.professionals.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              const costs = item.activityCosts.length
                ? item.activityCosts
                : draft.activities
                    .filter((activity) => activity.professionalIds.includes(item.id))
                    .map((activity) => ({ activityId: activity.id, cost: activity.cost }));
              setProfessional(structuredClone({ ...item, activityCosts: costs }));
            }}
            className="flex items-center gap-3 rounded-xl bg-surface px-3 py-3 text-left shadow-border"
          >
            <span className="size-3 shrink-0 rounded-full" style={{ background: item.color }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{item.name}</span>
              <span className="block truncate text-xs text-ink-muted">{item.specialty} · {item.phone}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Salas</p>
        <ul className="mt-3 flex flex-col gap-2">
          {draft.rooms.map((room, index) => (
            <li key={room.id}>
              <Input
                value={room.name}
                aria-label={`Sala ${index + 1}`}
                onChange={(event) => {
                  const rooms = draft.rooms.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, name: event.target.value } : item,
                  );
                  setDraft({ ...draft, rooms });
                }}
              />
            </li>
          ))}
        </ul>
        <Button className="mt-3" variant="outline" onClick={() => setDraft({ ...draft, rooms: [...draft.rooms, { id: `room-${Date.now()}`, name: "Nueva sala" }] })}>
          Añadir sala
        </Button>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Horario de apertura de la clínica</p>
        <ul className="mt-3 flex flex-col gap-3">
          {draft.hours.map((day, index) => (
            <li key={day.day} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <span className="text-sm text-ink">{day.label}</span>
              <Input type="time" value={day.open} aria-label={`Apertura ${day.label}`} className="w-28" disabled={day.closed} onChange={(event) => updateHour(index, { open: event.target.value })} />
              <Input type="time" value={day.close} aria-label={`Cierre ${day.label}`} className="w-28" disabled={day.closed} onChange={(event) => updateHour(index, { close: event.target.value })} />
              <button type="button" className="col-span-3 text-left text-xs font-medium text-accent" onClick={() => updateHour(index, { closed: !day.closed })}>
                {day.closed ? "Abrir este día" : "Marcar cerrado"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Button disabled={save.isPending} onClick={() => save.mutate(draft)}>
        Guardar salas y horario
      </Button>

      <ClinicDesk />

      <RecordDialog
        open={activity !== null}
        title={activity?.name || "Actividad"}
        description="Precio, coste, color, enlaces y quién puede hacerla."
        onOpenChange={(open) => { if (!open) setActivity(null); }}
      >
        {activity ? (
          <ActivityForm
            activity={activity}
            catalog={draft}
            onChange={setActivity}
            onSave={() => {
              const exists = draft.activities.some((item) => item.id === activity.id);
              const activities = exists
                ? draft.activities.map((item) => (item.id === activity.id ? activity : item))
                : [...draft.activities, activity];
              commit({ ...draft, activities });
              setActivity(null);
            }}
          />
        ) : null}
      </RecordDialog>

      <RecordDialog
        open={professional !== null}
        title={professional?.name || "Profesional"}
        description="Contacto, horario de atención, actividades y coste."
        onOpenChange={(open) => { if (!open) setProfessional(null); }}
      >
        {professional ? (
          <ProfessionalForm
            professional={professional}
            catalog={draft}
            onChange={setProfessional}
            onAgenda={() => {
              setDoctor(professional.name);
              void navigate({ to: "/agenda" });
            }}
            onSave={() => {
              const exists = draft.professionals.some((item) => item.id === professional.id);
              const professionals = exists
                ? draft.professionals.map((item) => (item.id === professional.id ? professional : item))
                : [...draft.professionals, professional];
              const activities = draft.activities.map((item) => {
                const linked = professional.activityCosts.some((cost) => cost.activityId === item.id) || item.professionalIds.includes(professional.id);
                const ids = item.professionalIds.filter((id) => id !== professional.id);
                return { ...item, professionalIds: linked ? [...ids, professional.id] : ids };
              });
              commit({ ...draft, professionals, activities });
              setProfessional(null);
            }}
          />
        ) : null}
      </RecordDialog>
    </div>
  );

  function updateHour(index: number, patch: Partial<OpeningDay>) {
    setDraft((current) => {
      if (!current) return current;
      const hours = current.hours.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
      return { ...current, hours };
    });
  }
}

function ActivityForm({
  activity,
  catalog,
  onChange,
  onSave,
}: {
  activity: Activity;
  catalog: ClinicCatalog;
  onChange: (activity: Activity) => void;
  onSave: () => void;
}) {
  const margin = activity.price - activity.cost;
  function set<K extends keyof Activity>(key: K, value: Activity[K]) {
    onChange({ ...activity, [key]: value });
  }
  return (
    <form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <Field label="Nombre" value={activity.name} onChange={(name) => set("name", name)} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Número" value={activity.code} onChange={(code) => set("code", code)} />
        <Field label="Duración (min)" value={String(activity.durationMin)} onChange={(value) => set("durationMin", Number(value) || 0)} />
        <Field label="Recordar a los (días)" value={activity.recallDays ? String(activity.recallDays) : ""} onChange={(value) => set("recallDays", value ? Number(value) || undefined : undefined)} />
        <Field label="Sector" value={activity.sector} onChange={(sector) => set("sector", sector)} />
        <Field label="Subsector" value={activity.subsector} onChange={(subsector) => set("subsector", subsector)} />
        <Field label="Precio" value={String(activity.price)} onChange={(value) => set("price", Number(value) || 0)} />
        <Field label="Coste" value={String(activity.cost)} onChange={(value) => set("cost", Number(value) || 0)} />
      </div>
      <p className="text-sm text-ink-muted">Margen {formatMoney(margin)} · {activity.price ? Math.round((margin / activity.price) * 100) : 0}% sobre el precio.</p>
      <label className="block text-xs text-ink-subtle">
        Descripción
        <textarea value={activity.description} onChange={(event) => set("description", event.target.value)} rows={3} className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-ink shadow-border" />
      </label>
      <div>
        <p className="text-xs text-ink-subtle">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITY_COLORS.map((color) => (
            <button key={color} type="button" aria-label={color} onClick={() => set("color", color)} className="size-9 rounded-full" style={{ background: color, outline: activity.color === color ? "2px solid #1A1D1C" : "none", outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-subtle">Profesionales capacitados</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {catalog.professionals.map((item) => {
            const on = activity.professionalIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => set("professionalIds", on ? activity.professionalIds.filter((id) => id !== item.id) : [...activity.professionalIds, item.id])}
                className={`h-9 rounded-full px-3 text-xs font-medium ${on ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
      <Links links={activity.links} onChange={(links) => set("links", links)} />
      <Attachments target={{ kind: "activity", activityId: activity.id }} files={activity.files ?? []} title="Documentos de la actividad" />
      <Button type="submit">Guardar ficha</Button>
    </form>
  );
}

function ProfessionalForm({
  professional,
  catalog,
  onChange,
  onSave,
  onAgenda,
}: {
  professional: Professional;
  catalog: ClinicCatalog;
  onChange: (professional: Professional) => void;
  onSave: () => void;
  onAgenda: () => void;
}) {
  function set<K extends keyof Professional>(key: K, value: Professional[K]) {
    onChange({ ...professional, [key]: value });
  }
  function linked(activityId: string) {
    return professional.activityCosts.some((item) => item.activityId === activityId);
  }
  return (
    <form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <Field label="Nombre" value={professional.name} onChange={(name) => set("name", name)} />
      <Field label="Especialidad" value={professional.specialty} onChange={(specialty) => set("specialty", specialty)} />
      <Field label="Teléfono" value={professional.phone} onChange={(phone) => set("phone", phone)} />
      <Field label="Correo" value={professional.email} onChange={(email) => set("email", email)} />
      <Field label="Nº colegiado (opcional)" value={professional.license ?? ""} onChange={(license) => set("license", license)} />
      <label className="block text-xs text-ink-subtle">
        CV breve (opcional)
        <textarea value={professional.cv ?? ""} onChange={(event) => set("cv", event.target.value)} rows={3} className="mt-1 w-full rounded-md bg-surface px-3 py-2 text-sm text-ink shadow-border" />
      </label>
      <div>
        <p className="text-xs text-ink-subtle">Color del horario de atención</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITY_COLORS.map((color) => (
            <button key={color} type="button" aria-label={color} onClick={() => set("color", color)} className="size-9 rounded-full" style={{ background: color, outline: professional.color === color ? "2px solid #1A1D1C" : "none", outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-ink-subtle">Horario de atención</p>
        <ul className="mt-2 flex flex-col gap-2">
          {professional.hours.map((day, index) => (
            <li key={day.day} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <span className="text-sm text-ink">{day.label}</span>
              <Input type="time" value={day.open} aria-label={`Desde ${day.label}`} className="w-28" disabled={day.closed} onChange={(event) => {
                const hours = professional.hours.map((item, itemIndex) => itemIndex === index ? { ...item, open: event.target.value } : item);
                set("hours", hours);
              }} />
              <Input type="time" value={day.close} aria-label={`Hasta ${day.label}`} className="w-28" disabled={day.closed} onChange={(event) => {
                const hours = professional.hours.map((item, itemIndex) => itemIndex === index ? { ...item, close: event.target.value } : item);
                set("hours", hours);
              }} />
              <button type="button" className="col-span-3 text-left text-xs font-medium" style={{ color: professional.color }} onClick={() => {
                const hours = professional.hours.map((item, itemIndex) => itemIndex === index ? { ...item, closed: !item.closed } : item);
                set("hours", hours);
              }}>
                {day.closed ? "Marcar atención" : "Sin atención este día"}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs text-ink-subtle">Actividades y coste asociado</p>
        <ul className="mt-2 flex flex-col gap-2">
          {catalog.activities.map((item) => {
            const on = linked(item.id);
            const cost = professional.activityCosts.find((row) => row.activityId === item.id)?.cost ?? item.cost;
            return (
              <li key={item.id} className="rounded-lg bg-surface p-2 shadow-border">
                <button type="button" className="text-sm font-medium text-ink" onClick={() => {
                  const activityCosts = on
                    ? professional.activityCosts.filter((row) => row.activityId !== item.id)
                    : [...professional.activityCosts.filter((row) => row.activityId !== item.id), { activityId: item.id, cost: item.cost }];
                  set("activityCosts", activityCosts);
                }}>
                  {on ? "Quitar" : "Añadir"} · {item.code} {item.name}
                </button>
                {on ? (
                  <Input className="mt-2" type="number" aria-label={`Coste ${item.name}`} value={String(cost)} onChange={(event) => {
                    const next = Number(event.target.value) || 0;
                    const activityCosts = professional.activityCosts.some((row) => row.activityId === item.id)
                      ? professional.activityCosts.map((row) => row.activityId === item.id ? { ...row, cost: next } : row)
                      : [...professional.activityCosts, { activityId: item.id, cost: next }];
                    set("activityCosts", activityCosts);
                  }} />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Guardar ficha</Button>
        <Button type="button" variant="outline" onClick={onAgenda}>Ver su agenda</Button>
      </div>
      <Attachments target={{ kind: "professional", professionalId: professional.id }} files={professional.files ?? []} title="Documentos del profesional" />
    </form>
  );
}

function Links({ links, onChange }: { links: ActivityLink[]; onChange: (links: ActivityLink[]) => void }) {
  return (
    <div>
      <p className="text-xs text-ink-subtle">Enlaces</p>
      <ul className="mt-2 flex flex-col gap-2">
        {links.map((link, index) => (
          <li key={index} className="grid gap-2">
            <Input value={link.label} aria-label="Texto del enlace" placeholder="Texto" onChange={(event) => onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} />
            <Input value={link.url} aria-label="URL" placeholder="https://" onChange={(event) => onChange(links.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} />
          </li>
        ))}
      </ul>
      <Button type="button" className="mt-2" variant="outline" size="sm" onClick={() => onChange([...links, { label: "", url: "" }])}>
        Añadir enlace
      </Button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs text-ink-subtle">
      {label}
      <Input className="mt-1" value={value} aria-label={label} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
