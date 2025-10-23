import { createFileRoute } from "@tanstack/react-router";
import { ActivityScene } from "@/components/scenes/activity";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/player/$player/activity",
)({
  component: ActivityScene,
});
