import { createFileRoute } from "@tanstack/react-router"
import { LeaderboardScene } from "@/components/scenes/leaderboard";
import { LeaderboardLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute(
  "/game/$game/edition/$edition/leaderboard",
)({
  component: LeaderboardScene,
  pendingComponent: LeaderboardLoading,
});
