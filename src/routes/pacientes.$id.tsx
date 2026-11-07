import { createFileRoute } from "@tanstack/react-router";
import { PatientProfile } from "@/components/patient/profile";

export const Route = createFileRoute("/pacientes/$id")({
  component: PatientPage,
});

function PatientPage() {
  const { id } = Route.useParams();
  return <PatientProfile id={id} />;
}
