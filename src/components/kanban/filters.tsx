import { useMemo, useState } from "react";
import { PIPELINE_STAGES, type Patient } from "@/lib/api";

export type FilterKind = "etapa" | "origen" | "profesional" | "tratamiento" | "etiqueta";

export interface BoardFilter {
  kind: FilterKind;
  value: string;
  label: string;
}

const KIND_LABEL: Record<FilterKind, string> = {
  etapa: "Etapa",
  origen: "Origen",
  profesional: "Profesional",
  tratamiento: "Tratamiento",
  etiqueta: "Etiqueta",
};

export function applyBoardFilters(patients: Patient[], filters: BoardFilter[], search: string) {
  const term = search.trim().toLowerCase();
  const grouped = new Map<FilterKind, string[]>();
  for (const filter of filters) {
    const current = grouped.get(filter.kind) ?? [];
    current.push(filter.value);
    grouped.set(filter.kind, current);
  }
  return patients.filter((patient) => {
    if (term) {
      const haystack = [patient.fullName, patient.treatmentInterest, patient.assignedTo, patient.source, patient.city, ...patient.tags]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    for (const [kind, values] of grouped) {
      const hit =
        kind === "etapa"
          ? values.includes(patient.stage)
          : kind === "origen"
            ? values.includes(patient.source)
            : kind === "profesional"
              ? values.includes(patient.assignedTo)
              : kind === "tratamiento"
                ? values.includes(patient.treatmentInterest)
                : patient.tags.some((tag) => values.includes(tag));
      if (!hit) return false;
    }
    return true;
  });
}

export function FilterField({
  patients,
  filters,
  onChange,
}: {
  patients: Patient[];
  filters: BoardFilter[];
  onChange: (filters: BoardFilter[]) => void;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const options = useMemo(() => suggestions(patients, filters, text), [patients, filters, text]);

  function add(option: BoardFilter) {
    onChange([...filters, option]);
    setText("");
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`h-10 rounded-full px-3 text-sm font-medium ${expanded ? "bg-accent text-accent-fg" : "bg-surface text-ink shadow-border"}`}
        >
          {expanded ? "Cerrar filtros" : filters.length ? `Filtros · ${filters.length}` : "Filtros"}
        </button>
        {filters.length > 0 ? (
          <button type="button" onClick={() => onChange([])} className="text-xs font-medium text-ink-muted">
            Limpiar
          </button>
        ) : null}
      </div>
      {filters.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <li key={`${filter.kind}:${filter.value}`}>
              <button
                type="button"
                onClick={() => onChange(filters.filter((item) => item.kind !== filter.kind || item.value !== filter.value))}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-accent-soft px-3 text-xs font-medium text-ink"
              >
                {KIND_LABEL[filter.kind]}: {filter.label}
                <span aria-hidden>×</span>
                <span className="sr-only">Quitar filtro</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {expanded ? (
        <label className="block text-xs text-ink-subtle">
          Añadir filtro
          <input
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && options[0]) {
                event.preventDefault();
                add(options[0]);
              }
              if (event.key === "Escape") {
                setOpen(false);
                setExpanded(false);
              }
            }}
            placeholder="Etapa, origen, profesional, tratamiento o etiqueta"
            className="mt-1 h-11 w-full rounded-md bg-surface px-3 text-sm text-ink shadow-border outline-none placeholder:text-ink-subtle"
          />
        </label>
      ) : null}
      {expanded && open && options.length > 0 ? (
        <ul className="flex flex-col overflow-hidden rounded-xl bg-surface shadow-border">
          {options.slice(0, 8).map((option) => (
            <li key={`${option.kind}:${option.value}`}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => add(option)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg"
              >
                <span className="text-ink">{option.label}</span>
                <span className="text-xs text-ink-subtle">{KIND_LABEL[option.kind]}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function suggestions(patients: Patient[], filters: BoardFilter[], text: string): BoardFilter[] {
  const taken = new Set(filters.map((filter) => `${filter.kind}:${filter.value}`));
  const query = text.trim().toLowerCase();
  const options: BoardFilter[] = [];
  for (const stage of PIPELINE_STAGES) {
    options.push({ kind: "etapa", value: stage.id, label: stage.label });
  }
  const pushUnique = (kind: FilterKind, value: string) => {
    if (!value || taken.has(`${kind}:${value}`)) return;
    if (options.some((option) => option.kind === kind && option.value === value)) return;
    options.push({ kind, value, label: value });
  };
  for (const patient of patients) {
    pushUnique("origen", patient.source);
    pushUnique("profesional", patient.assignedTo);
    pushUnique("tratamiento", patient.treatmentInterest);
    for (const tag of patient.tags) pushUnique("etiqueta", tag);
  }
  return options.filter((option) => {
    if (taken.has(`${option.kind}:${option.value}`)) return false;
    if (!query) return true;
    return `${KIND_LABEL[option.kind]} ${option.label}`.toLowerCase().includes(query);
  });
}
