import { createFileRoute } from "@tanstack/react-router";
import { StarterpackClaimPage } from "@/components/pages/starterpack-claim";

export const Route = createFileRoute("/starterpack/$starterpackId")({
  component: StarterpackClaimPage,
});
