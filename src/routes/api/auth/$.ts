import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

async function handle({ request }: { request: Request }) {
  const { ensureAdmin } = await import("@/lib/api/ensure-admin.server");
  await ensureAdmin();
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
