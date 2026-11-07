import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/clinic/dashboard";

export const Route = createFileRoute("/mandos")({
  component: Dashboard,
});
