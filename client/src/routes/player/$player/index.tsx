import { createFileRoute } from "@tanstack/react-router";
import { InventoryScene } from "@/components/scenes/inventory";

export const Route = createFileRoute("/player/$player/")({
  component: InventoryScene,
});
