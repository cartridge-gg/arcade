import { PositionsScene } from "@/components/scenes/positions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game_/player/$player/positions")({
  component: PositionsScene,
});
