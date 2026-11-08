import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { readClinicBook, writeClinicBook } from "./book.functions";
import { applySnapshot, currentSnapshot, localRevision } from "./client";
import type { Snapshot } from "./persist";

export async function publishSnapshot(snapshot: Snapshot) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  try {
    const result = await writeClinicBook({ data: { revision: snapshot.revision ?? 1, snapshot } });
    if (!result.ok && result.snapshot) applySnapshot({ ...result.snapshot, revision: result.revision });
  } catch {
    /* the phone keeps the copy */
  }
}

let pulling = false;

export async function pullClinicBook() {
  if (pulling) return "same" as const;
  pulling = true;
  try {
    const remote = await readClinicBook();
    if (!remote || typeof remote.revision !== "number") return "same" as const;
    if (remote.snapshot && remote.revision > localRevision()) {
      applySnapshot({ ...remote.snapshot, revision: remote.revision });
      return "updated" as const;
    }
    if (remote.revision === 0 && localRevision() === 0) {
      const snap = { ...currentSnapshot(), revision: 1 };
      applySnapshot(snap);
      await publishSnapshot(snap);
      return "seeded" as const;
    }
    if (remote.revision === 0 && localRevision() > 0) {
      await publishSnapshot(currentSnapshot());
      return "seeded" as const;
    }
    return "same" as const;
  } finally {
    pulling = false;
  }
}

export function ClinicSync() {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("Libro de la clínica");

  useEffect(() => {
    let alive = true;
    async function tick() {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        if (alive) setLabel("Sin red · se sube al volver");
        return;
      }
      try {
        const status = await pullClinicBook();
        if (status === "updated") void queryClient.invalidateQueries();
        if (alive) setLabel("Libro compartido · al día");
      } catch {
        if (alive) setLabel("Sin red · se sube al volver");
      }
    }
    void tick();
    const id = window.setInterval(() => void tick(), 8000);
    window.addEventListener("online", () => void tick());
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [queryClient]);

  return <p className="px-4 pb-2 text-2xs text-ink-subtle sm:px-6">{label}</p>;
}
