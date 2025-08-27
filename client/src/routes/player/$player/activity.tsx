import { createFileRoute } from "@tanstack/react-router"
import { DiscoverScene } from "@/components/scenes/discover";
import { DiscoverLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute("/player/$player/activity")({
  component: DiscoverScene,
  pendingComponent: DiscoverLoading,
});
