import { createFileRoute } from "@tanstack/react-router"
import { InventoryScene } from "@/components/scenes/inventory";
import { createSimpleRoute } from "@/lib/router";

export const Route = createSimpleRoute("/inventory")({
  component: InventoryScene,
});