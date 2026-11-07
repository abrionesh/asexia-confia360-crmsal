import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Activity, ClinicCatalog, OpeningDay } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUiStore } from "@/lib/store/ui";

export function Admin() {
  const role = useUiStore((state) => state.role);
  const queryClient = useQueryClient();
  const catalogQuery = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const [draft, setDraft] = useState<ClinicCatalog | null>(null);

  useEffect(() => {
    if (catalogQuery.data && !draft) setDraft(structuredClone(catalogQuery.data));
  }, [catalogQuery.data, draft]);

  const save = useMutation({
    mutationFn: () => api.saveCatalog(draft as ClinicCatalog),
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

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-kicker">Administración</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Catálogo de la clínica</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Sector, actividad, duración, precio, horario y salas. La agenda y el cuadro de mandos leen de aquí.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        {draft.activities.map((activity, index) => (
          <article key={activity.id} className="rounded-xl bg-surface p-4 shadow-border">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Actividad" value={activity.name} onChange={(name) => updateActivity(index, { name })} />
              <Field label="Sector" value={activity.sector} onChange={(sector) => updateActivity(index, { sector })} />
              <Field label="Subsector" value={activity.subsector} onChange={(subsector) => updateActivity(index, { subsector })} />
              <Field label="Duración (min)" value={String(activity.durationMin)} onChange={(value) => updateActivity(index, { durationMin: Number(value) || 0 })} />
              <Field label="Precio" value={String(activity.price)} onChange={(value) => updateActivity(index, { price: Number(value) || 0 })} />
              <Field label="Descripción" value={activity.description} onChange={(description) => updateActivity(index, { description })} />
            </div>
          </article>
        ))}
        <Button
          variant="outline"
          onClick={() =>
            setDraft({
              ...draft,
              activities: [
                ...draft.activities,
                { id: `act-${Date.now()}`, sector: "Medicina estética", subsector: "Facial", name: "Nueva actividad", description: "", durationMin: 30, price: 0 },
              ],
            })
          }
        >
          Añadir actividad
        </Button>
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
        <Button
          className="mt-3"
          variant="outline"
          onClick={() =>
            setDraft({ ...draft, rooms: [...draft.rooms, { id: `room-${Date.now()}`, name: "Nueva sala" }] })
          }
        >
          Añadir sala
        </Button>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-border">
        <p className="label-kicker">Horario de apertura</p>
        <ul className="mt-3 flex flex-col gap-3">
          {draft.hours.map((day, index) => (
            <li key={day.day} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <span className="text-sm text-ink">{day.label}</span>
              <Input
                type="time"
                value={day.open}
                aria-label={`Apertura ${day.label}`}
                className="w-28"
                disabled={day.closed}
                onChange={(event) => updateHour(index, { open: event.target.value })}
              />
              <Input
                type="time"
                value={day.close}
                aria-label={`Cierre ${day.label}`}
                className="w-28"
                disabled={day.closed}
                onChange={(event) => updateHour(index, { close: event.target.value })}
              />
              <button
                type="button"
                className="col-span-3 text-left text-xs font-medium text-accent"
                onClick={() => updateHour(index, { closed: !day.closed })}
              >
                {day.closed ? "Abrir este día" : "Marcar cerrado"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Button disabled={save.isPending} onClick={() => save.mutate()}>
        Guardar catálogo
      </Button>
    </div>
  );

  function updateActivity(index: number, patch: Partial<Activity>) {
    setDraft((current) => {
      if (!current) return current;
      const activities = current.activities.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      );
      return { ...current, activities };
    });
  }

  function updateHour(index: number, patch: Partial<OpeningDay>) {
    setDraft((current) => {
      if (!current) return current;
      const hours = current.hours.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      );
      return { ...current, hours };
    });
  }
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs text-ink-subtle">
      {label}
      <Input className="mt-1" value={value} aria-label={label} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
