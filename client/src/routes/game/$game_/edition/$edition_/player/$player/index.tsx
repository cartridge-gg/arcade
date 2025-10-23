import { createFileRoute } from "@tanstack/react-router";
import { InventoryScene } from "@/components/scenes/inventory";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/player/$player/",
)({
  component: InventoryScene,
});
