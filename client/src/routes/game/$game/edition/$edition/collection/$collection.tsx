import { createFileRoute } from "@tanstack/react-router"
import { ItemsScene } from "@/components/scenes/items";
import { InventoryLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute(
  "/game/$game/edition/$edition/collection/$collection",
)({
  component: ItemsScene,
  pendingComponent: InventoryLoading,
});
