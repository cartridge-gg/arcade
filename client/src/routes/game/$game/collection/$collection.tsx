import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceScene } from "@/components/scenes/marketplace";

export const Route = createFileRoute("/game/$game/collection/$collection")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: MarketplaceScene,
});
