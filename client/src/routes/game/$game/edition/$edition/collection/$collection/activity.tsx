import { createFileRoute } from "@tanstack/react-router"
import { TraceabilityScene } from "@/components/scenes/traceability";
import { ActivityLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute(
  "/game/$game/edition/$edition/collection/$collection/activity",
)({
  component: TraceabilityScene,
  pendingComponent: ActivityLoading,
});
