import { createFileRoute, Link } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban/board";
import { useUiStore } from "@/lib/store/ui";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const role = useUiStore((state) => state.role);
  if (role === "medico") {
    return (
      <div className="rounded-xl bg-surface px-5 py-8 shadow-border">
        <p className="label-kicker">Consulta</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-ink">Su sala está en la agenda</h1>
        <p className="mt-2 text-sm text-ink-muted">El tablero comercial es de recepción y dirección.</p>
        <Link to="/agenda" className="mt-4 inline-flex h-11 items-center text-sm font-medium text-accent">
          Abrir agenda
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="label-kicker">Pipeline comercial</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
          Tablero de leads
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Columnas, lista o agrupado. Los filtros se abren y se cierran. Lo que hay que avisar está en Actuar.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
