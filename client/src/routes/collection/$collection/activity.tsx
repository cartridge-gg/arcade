import { createFileRoute } from "@tanstack/react-router";
import { TraceabilityScene } from "@/components/scenes/traceability";

export const Route = createFileRoute("/collection/$collection/activity")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: TraceabilityScene,
});
