import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/clinic/admin";

export const Route = createFileRoute("/admin")({
  component: Admin,
});
