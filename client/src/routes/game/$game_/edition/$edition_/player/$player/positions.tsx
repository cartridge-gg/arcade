import { createFileRoute } from "@tanstack/react-router";
import { PositionsScene } from "@/components/scenes/positions";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/player/$player/positions",
)({
  component: PositionsScene,
});
