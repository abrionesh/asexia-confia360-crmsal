import { createFileRoute } from "@tanstack/react-router";
import { Agenda } from "@/components/clinic/agenda";

export const Route = createFileRoute("/agenda")({
  component: Agenda,
});
