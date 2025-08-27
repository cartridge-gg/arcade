import { createFileRoute } from "@tanstack/react-router"
import { HoldersScene } from "@/components/scenes/holders";
import { InventoryLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute(
  "/game/$game/edition/$edition/collection/$collection/holders",
)({
  component: HoldersScene,
  pendingComponent: InventoryLoading,
});
