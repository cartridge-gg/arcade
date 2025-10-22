import { createFileRoute } from "@tanstack/react-router";
import { PositionsScene } from "@/components/scenes/positions";

export const Route = createFileRoute("/player/$player/positions")({
  component: PositionsScene,
});
