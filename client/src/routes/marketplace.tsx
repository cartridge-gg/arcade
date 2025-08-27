import { createFileRoute } from "@tanstack/react-router"
import { MarketplaceScene } from "@/components/scenes/marketplace";
import { MarketplaceLoading } from "@/components/errors";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute("/marketplace")({
  path: "/marketplace",
  component: MarketplaceScene,
  pendingComponent: MarketplaceLoading,
});