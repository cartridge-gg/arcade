import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardScene } from "@/components/scenes/leaderboard";

export const Route = createFileRoute(
  "/game/$game/edition/$edition/leaderboard",
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: LeaderboardScene,
});
