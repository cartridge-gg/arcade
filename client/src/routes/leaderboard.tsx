import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardScene } from "@/components/scenes/leaderboard";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardScene,
});
