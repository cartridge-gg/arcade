import { createFileRoute } from "@tanstack/react-router"
import { GuildsScene } from "@/components/scenes/guild";
import { GuildsLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute("/game/$game/edition/$edition/guilds")({
  component: GuildsScene,
  pendingComponent: GuildsLoading,
});
