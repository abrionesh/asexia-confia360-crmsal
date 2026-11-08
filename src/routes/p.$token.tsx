import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/portal/page";

export const Route = createFileRoute("/p/$token")({
  component: PortalRoute,
});

function PortalRoute() {
  const { token } = Route.useParams();
  return <PortalPage token={token} />;
}
