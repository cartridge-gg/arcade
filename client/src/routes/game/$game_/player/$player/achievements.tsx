import { createFileRoute } from "@tanstack/react-router";
import { AchievementScene } from "@/components/scenes/achievement";

export const Route = createFileRoute(
  "/game/$game_/player/$player/achievements",
)({
  component: AchievementScene,
});
