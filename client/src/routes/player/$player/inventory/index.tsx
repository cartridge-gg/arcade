import { InventoryScene } from "@/components/scenes/inventory";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/player/$player/inventory/")({
  component: InventoryScene,
});
