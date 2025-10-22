import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceScene } from "@/components/scenes/marketplace";

export const Route = createFileRoute("/")({
  component: MarketplaceScene,
});
