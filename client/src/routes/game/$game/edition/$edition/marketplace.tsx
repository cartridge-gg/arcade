import { createFileRoute } from "@tanstack/react-router"
import { MarketplaceScene } from "@/components/scenes/marketplace";
import { MarketplaceLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute(
  "/game/$game/edition/$edition/marketplace",
)({
  component: MarketplaceScene,
  pendingComponent: MarketplaceLoading,
});
