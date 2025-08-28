import { createFileRoute } from "@tanstack/react-router"
import { InventoryScene } from "@/components/scenes/inventory";
import { InventoryLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute("/game/$game/edition/$edition/player/$player/inventory")({
  component: InventoryScene,
  pendingComponent: InventoryLoading,
});
