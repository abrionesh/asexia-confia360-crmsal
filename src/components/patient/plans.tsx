import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type Patient } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function PatientPlans({ patient }: { patient: Patient }) {
  const queryClient = useQueryClient();
  const desk = useQuery({ queryKey: ["desk"], queryFn: () => api.listDesk() });
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: () => api.getCatalog() });
  const [packId, setPackId] = useState("");
  const [professional, setProfessional] = useState(patient.assignedTo);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["patient", patient.id] });
    void queryClient.invalidateQueries({ queryKey: ["timeline", patient.id] });
  };
  const assign = useMutation({
    mutationFn: () => api.assignPlan(patient.id, packId, professional),
    onSuccess: (saved) => {
      if (!saved) toast.error("Elija un pack y un profesional.");
      else {
        toast.success("Plan en la ficha");
        refresh();
      }
    },
  });
  const changePro = useMutation({
    mutationFn: ({ planId, name }: { planId: string; name: string }) => api.setPlanProfessional(patient.id, planId, name),
    onSuccess: () => refresh(),
  });
  const packs = desk.data?.packs ?? [];
  const people = catalog.data?.professionals ?? [];
  const plans = patient.plans ?? [];

  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="label-kicker">Plan de sesiones</p>
      <h3 className="mt-1 font-display text-xl font-medium text-ink">Packs del paciente</h3>
      <p className="mt-1 text-sm text-ink-muted">
        Al marcar una visita como hecha, la siguiente sesión del pack queda programada. El profesional se puede cambiar aquí.
      </p>
      {plans.length === 0 ? <p className="mt-3 text-sm text-ink-muted">Todavía no hay un pack asignado.</p> : null}
      <ul className="mt-3 flex flex-col gap-3">
        {plans.map((plan) => (
          <li key={plan.id} className="rounded-lg bg-bg p-3">
            <p className="text-sm font-medium text-ink">{plan.name}</p>
            <label className="mt-2 block text-xs text-ink-muted">
              Profesional
              <select
                className="mt-1 h-10 w-full rounded-md bg-surface px-2 text-sm text-ink shadow-border"
                value={plan.professional}
                onChange={(event) => changePro.mutate({ planId: plan.id, name: event.target.value })}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.name}>{person.name}</option>
                ))}
                {people.some((person) => person.name === plan.professional) ? null : <option value={plan.professional}>{plan.professional}</option>}
              </select>
            </label>
            <ol className="mt-2 flex flex-col gap-1 text-sm text-ink-muted">
              {plan.steps.map((step, index) => (
                <li key={step.id}>
                  {index + 1}. {step.action} · {step.status === "hecha" ? "hecha" : "pendiente"}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
      {packs.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select className="h-11 flex-1 rounded-md bg-bg px-3 text-sm text-ink shadow-border" value={packId} onChange={(event) => setPackId(event.target.value)} aria-label="Pack">
            <option value="">Elegir pack</option>
            {packs.map((pack) => (
              <option key={pack.id} value={pack.id}>{pack.name}</option>
            ))}
          </select>
          <select className="h-11 flex-1 rounded-md bg-bg px-3 text-sm text-ink shadow-border" value={professional} onChange={(event) => setProfessional(event.target.value)} aria-label="Profesional del plan">
            {people.map((person) => (
              <option key={person.id} value={person.name}>{person.name}</option>
            ))}
          </select>
          <Button disabled={assign.isPending || !packId} onClick={() => assign.mutate()}>Asignar</Button>
        </div>
      ) : null}
    </div>
  );
}
