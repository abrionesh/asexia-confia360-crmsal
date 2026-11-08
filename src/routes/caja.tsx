import { createFileRoute } from "@tanstack/react-router";
import { CashDesk } from "@/components/clinic/cash-desk";

export const Route = createFileRoute("/caja")({
  component: CashDesk,
});
