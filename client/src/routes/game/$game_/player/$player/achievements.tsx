import { createFileRoute } from "@tanstack/react-router";
import { PlayerPage } from "@/components/pages/player";

export const Route = createFileRoute(
  "/game/$game_/player/$player/achievements",
)({
  component: PlayerPage,
});
