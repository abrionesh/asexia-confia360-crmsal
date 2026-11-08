import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { PayMethod } from "@/lib/api/types";
import { dayKey, isDayClosed, METHOD_LABEL, PAY_METHODS, previstoByMethod, tpvByMethod } from "@/lib/ops";
import { formatMoney } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CashDesk() {
  const role = useUiStore((state) => state.role);
  const [day, setDay] = useState(dayKey(new Date()));
  const [method, setMethod] = useState<PayMethod>("tarjeta");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("Cierre TPV");
  const queryClient = useQueryClient();
  const desk = useQuery({ queryKey: ["desk"], queryFn: () => api.listDesk() });
  const pipeline = useQuery({ queryKey: ["pipeline"], queryFn: () => api.listPipeline() });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["desk"] });
    void queryClient.invalidateQueries({ queryKey: ["pipeline"] });
  };
  const add = useMutation({
    mutationFn: () => api.addTpv({ day, method, amount: Number(amount.replace(",", ".")), concept }),
    onSuccess: (line) => {
      if (!line) toast.error("Indique un importe.");
      else {
        setAmount("");
        toast.success("TPV cargado");
      }
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message.replace(/^caja: /, "") : "No se pudo cargar"),
  });
  const close = useMutation({
    mutationFn: () => api.closeDay(day),
    onSuccess: () => {
      toast.success("Día cerrado. Ese total ya no se toca.");
      refresh();
    },
  });

  if (role === "medico") {
    return <p className="text-sm text-ink-muted">La caja la cierran dirección y recepción.</p>;
  }

  const patients = pipeline.data ?? [];
  const lines = (desk.data?.tpv ?? []).filter((item) => item.day === day);
  const closed = desk.data ? isDayClosed(desk.data.closes, day) : false;
  const frozen = desk.data?.closes.find((item) => item.day === day);
  const previsto = frozen?.previsto ?? previstoByMethod(patients, day);
  const tpv = frozen?.tpv ?? tpvByMethod(lines, day);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-kicker">Caja</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Cierre del día</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Durante el día las cifras son una previsión a partir de los cobros de la clínica. Al cargar el TPV, por la mañana o al cierre del turno, se consolidan. Cerrar el día deja un total que ya no se puede tocar.
        </p>
      </div>
      <label className="max-w-xs text-sm">
        <span className="text-ink-muted">Día</span>
        <Input className="mt-1" type="date" value={day} onChange={(event) => setDay(event.target.value)} />
      </label>
      <section className="grid gap-3 sm:grid-cols-2">
        <Totals title={closed ? "Previsto, ya cerrado" : "Previsto · cobros de la clínica"} totals={previsto} />
        <Totals title={closed ? "TPV, ya cerrado" : "TPV cargado"} totals={tpv} />
      </section>
      {closed ? (
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-ink shadow-border">
          Día cerrado. No se añaden cobros ni líneas de TPV.
        </p>
      ) : (
        <form
          className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-border"
          onSubmit={(event) => {
            event.preventDefault();
            add.mutate();
          }}
        >
          <p className="label-kicker">Cargar TPV</p>
          <div className="flex flex-wrap gap-2">
            {PAY_METHODS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMethod(item)}
                className={`h-10 rounded-full px-3 text-sm font-medium ${method === item ? "bg-accent text-accent-fg" : "bg-bg text-ink-muted"}`}
              >
                {METHOD_LABEL[item]}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input inputMode="decimal" placeholder="Importe" aria-label="Importe TPV" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <Input placeholder="Concepto" aria-label="Concepto TPV" value={concept} onChange={(event) => setConcept(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" disabled={add.isPending || desk.isPending}>
              Añadir línea
            </Button>
            <Button type="button" disabled={close.isPending || desk.isPending} onClick={() => close.mutate()}>
              Cerrar el día
            </Button>
          </div>
        </form>
      )}
      {lines.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm shadow-border">
              <span>
                <span className="block font-medium text-ink">{line.concept}</span>
                <span className="text-xs text-ink-muted">{METHOD_LABEL[line.method]}</span>
              </span>
              <span className="tabular-nums text-ink">{formatMoney(line.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Totals({ title, totals }: { title: string; totals: Record<PayMethod, number> }) {
  const sum = PAY_METHODS.reduce((acc, method) => acc + totals[method], 0);
  return (
    <section className="rounded-xl bg-surface p-4 shadow-border">
      <p className="label-kicker">{title}</p>
      <p className="mt-1 font-display text-3xl font-medium tabular-nums text-ink">{formatMoney(sum)}</p>
      <ul className="mt-3 flex flex-col gap-1 text-sm">
        {PAY_METHODS.map((method) => (
          <li key={method} className="flex justify-between text-ink-muted">
            <span>{METHOD_LABEL[method]}</span>
            <span className="tabular-nums text-ink">{formatMoney(totals[method])}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
