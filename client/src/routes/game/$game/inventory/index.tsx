import { InventoryScene } from "@/components/scenes/inventory";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game/inventory/")({
  component: InventoryScene,
});
