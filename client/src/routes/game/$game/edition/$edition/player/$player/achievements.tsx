import { createFileRoute } from "@tanstack/react-router"
import { AchievementScene } from "@/components/scenes/achievement";
import { AchievementsLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute("/game/$game/edition/$edition/player/$player/achievements")(
  {
    component: AchievementScene,
    pendingComponent: AchievementsLoading,
  },
);
