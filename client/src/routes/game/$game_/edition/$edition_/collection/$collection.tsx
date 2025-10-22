import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceScene } from "@/components/scenes/marketplace";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/collection/$collection",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: MarketplaceScene,
});
