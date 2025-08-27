import { createFileRoute } from "@tanstack/react-router"
import { AboutScene } from "@/components/scenes/about";
import { AboutLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute("/game/$game/edition/$edition/about")({
  component: AboutScene,
  pendingComponent: AboutLoading,
});
