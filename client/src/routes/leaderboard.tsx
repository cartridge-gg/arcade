import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardScene } from "@/components/scenes/leaderboard";

function Test() {
  return (
    <h1>One two this is a test</h1>
  )
}

export const Route = createFileRoute("/leaderboard")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: LeaderboardScene,
  pendingComponent: Test,
});
