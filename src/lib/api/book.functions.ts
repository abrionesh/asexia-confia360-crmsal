import { createServerFn } from "@tanstack/react-start";
import type { Snapshot } from "./persist";

/**
 * Shared clinic book for whoever is using this running app.
 * Memory only: a fresh process starts empty until the first phone uploads its copy.
 * Clinical data is not written to the database.
 */
let revision = 0;
let snapshot: Snapshot | null = null;
const files: Record<string, string> = {};

export const readClinicBook = createServerFn({ method: "GET" }).handler(async () => ({
  revision,
  snapshot,
}));

export const writeClinicBook = createServerFn({ method: "POST" })
  .validator((data: { revision: number; snapshot: Snapshot }) => data)
  .handler(async ({ data }) => {
    if (data.revision <= revision) return { ok: false as const, revision, snapshot };
    revision = data.revision;
    snapshot = data.snapshot;
    return { ok: true as const, revision };
  });

export const putClinicFile = createServerFn({ method: "POST" })
  .validator((data: { id: string; dataUrl: string }) => data)
  .handler(async ({ data }) => {
    if (data.dataUrl.length > 2_200_000) return { ok: false as const };
    files[data.id] = data.dataUrl;
    return { ok: true as const };
  });

export const getClinicFile = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => files[data.id] ?? null);
