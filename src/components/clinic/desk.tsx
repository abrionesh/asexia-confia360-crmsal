import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { StockItem, TreatmentPack } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StockBanner() {
  const desk = useQuery({ queryKey: ["desk"], queryFn: () => api.listDesk() });
  const low = (desk.data?.stock ?? []).filter((item) => item.quantity <= item.min);
  if (low.length === 0) return null;
  return (
    <p className="rounded-xl bg-surface px-4 py-3 text-sm text-ink shadow-border">
      Stock bajo: {low.map((item) => `${item.name} (${item.quantity} ${item.unit})`).join(" · ")}
    </p>
  );
}

export function ClinicDesk() {
  const queryClient = useQueryClient();
  const desk = useQuery({ queryKey: ["desk"], queryFn: () => api.listDesk() });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const [stock, setStock] = useState<StockItem[] | null>(null);
  const [packs, setPacks] = useState<TreatmentPack[] | null>(null);

  useEffect(() => {
    if (desk.data && !stock) setStock(structuredClone(desk.data.stock));
    if (desk.data && !packs) setPacks(structuredClone(desk.data.packs));
  }, [desk.data, stock, packs]);

  const saveStock = useMutation({
    mutationFn: () => api.saveStock(stock ?? []),
    onSuccess: (saved) => {
      setStock(structuredClone(saved));
      void queryClient.invalidateQueries({ queryKey: ["desk"] });
      toast.success("Stock guardado");
    },
  });
  const savePacks = useMutation({
    mutationFn: () => api.savePacks(packs ?? []),
    onSuccess: (saved) => {
      setPacks(structuredClone(saved));
      void queryClient.invalidateQueries({ queryKey: ["desk"] });
      toast.success("Packs guardados");
    },
  });

  if (!stock || !packs || !catalog.data) return null;
  const activities = catalog.data.activities;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="label-kicker">Almacén</p>
            <h2 className="font-display text-2xl font-medium text-ink">Viales y material</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setStock([
                ...stock,
                { id: `stock-${Date.now()}`, name: "Nuevo material", unit: "ud", quantity: 0, min: 1, perVisit: 1 },
              ])
            }
          >
            Añadir
          </Button>
        </div>
        <p className="text-sm text-ink-muted">Al marcar una visita como hecha se descuenta el material ligado a esa actividad.</p>
        {stock.map((item, index) => (
          <div key={item.id} className="grid gap-2 rounded-xl bg-surface p-3 shadow-border sm:grid-cols-6">
            <Input className="sm:col-span-2" aria-label="Material" value={item.name} onChange={(event) => setStock(stock.map((row, i) => (i === index ? { ...row, name: event.target.value } : row)))} />
            <Input aria-label="Unidad" value={item.unit} onChange={(event) => setStock(stock.map((row, i) => (i === index ? { ...row, unit: event.target.value } : row)))} />
            <Input aria-label="Cantidad" inputMode="numeric" value={String(item.quantity)} onChange={(event) => setStock(stock.map((row, i) => (i === index ? { ...row, quantity: Number(event.target.value) } : row)))} />
            <Input aria-label="Mínimo" inputMode="numeric" value={String(item.min)} onChange={(event) => setStock(stock.map((row, i) => (i === index ? { ...row, min: Number(event.target.value) } : row)))} />
            <Input aria-label="Por visita" inputMode="numeric" value={String(item.perVisit)} onChange={(event) => setStock(stock.map((row, i) => (i === index ? { ...row, perVisit: Number(event.target.value) } : row)))} />
            <select
              aria-label="Actividad que lo consume"
              className="h-11 rounded-md bg-bg px-3 text-sm text-ink shadow-border sm:col-span-4"
              value={item.activityId ?? ""}
              onChange={(event) => setStock(stock.map((row, i) => (i === index ? { ...row, activityId: event.target.value || undefined } : row)))}
            >
              <option value="">Sin actividad — no se descuenta solo</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>{activity.name}</option>
              ))}
            </select>
            <Button className="sm:col-span-2" variant="ghost" size="sm" onClick={() => setStock(stock.filter((_, i) => i !== index))}>
              Quitar
            </Button>
          </div>
        ))}
        <Button disabled={saveStock.isPending} onClick={() => saveStock.mutate()}>Guardar stock</Button>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="label-kicker">Tratamientos</p>
            <h2 className="font-display text-2xl font-medium text-ink">Packs y sesiones</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPacks([
                ...packs,
                {
                  id: `pack-${Date.now()}`,
                  name: "Nuevo pack",
                  summary: "",
                  steps: [{ id: `step-${Date.now()}`, activityId: activities[0]?.id ?? "", action: "Primera sesión", afterDays: 28 }],
                },
              ])
            }
          >
            Nuevo pack
          </Button>
        </div>
        <p className="text-sm text-ink-muted">
          Cada pack es una ficha. Se asigna a un paciente y el profesional se adapta en su ficha. Al marcar una sesión como hecha, se programa la siguiente.
        </p>
        {packs.map((pack, packIndex) => (
          <article key={pack.id} className="flex flex-col gap-2 rounded-xl bg-surface p-4 shadow-border">
            <Input aria-label="Nombre del pack" value={pack.name} onChange={(event) => setPacks(packs.map((item, i) => (i === packIndex ? { ...item, name: event.target.value } : item)))} />
            <Input aria-label="Resumen del pack" value={pack.summary} onChange={(event) => setPacks(packs.map((item, i) => (i === packIndex ? { ...item, summary: event.target.value } : item)))} />
            {pack.steps.map((step, stepIndex) => (
              <div key={step.id} className="grid gap-2 sm:grid-cols-6">
                <select
                  aria-label={`Actividad sesión ${stepIndex + 1}`}
                  className="h-11 rounded-md bg-bg px-3 text-sm text-ink shadow-border sm:col-span-2"
                  value={step.activityId}
                  onChange={(event) =>
                    setPacks(packs.map((item, i) => i === packIndex ? { ...item, steps: item.steps.map((row, j) => (j === stepIndex ? { ...row, activityId: event.target.value } : row)) } : item))
                  }
                >
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>{activity.name}</option>
                  ))}
                </select>
                <Input className="sm:col-span-3" aria-label="Qué hay que hacer" value={step.action} onChange={(event) => setPacks(packs.map((item, i) => i === packIndex ? { ...item, steps: item.steps.map((row, j) => (j === stepIndex ? { ...row, action: event.target.value } : row)) } : item))} />
                <Input aria-label="Días hasta la siguiente" inputMode="numeric" value={String(step.afterDays)} onChange={(event) => setPacks(packs.map((item, i) => i === packIndex ? { ...item, steps: item.steps.map((row, j) => (j === stepIndex ? { ...row, afterDays: Number(event.target.value) || 0 } : row)) } : item))} />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setPacks(packs.map((item, i) => i === packIndex ? { ...item, steps: [...item.steps, { id: `step-${Date.now()}`, activityId: activities[0]?.id ?? "", action: "Siguiente sesión", afterDays: 28 }] } : item))
                }
              >
                Añadir sesión
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPacks(packs.filter((_, i) => i !== packIndex))}>
                Quitar pack
              </Button>
            </div>
          </article>
        ))}
        <Button disabled={savePacks.isPending} onClick={() => savePacks.mutate()}>Guardar packs</Button>
      </section>
    </div>
  );
}
