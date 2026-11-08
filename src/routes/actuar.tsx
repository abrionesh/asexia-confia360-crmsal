import { createFileRoute } from "@tanstack/react-router";
import { ActuarHub } from "@/components/actuar/hub";

export const Route = createFileRoute("/actuar")({
  component: ActuarHub,
});
