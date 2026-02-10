import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceItemsPage } from "@/components/scenes/marketplace-items-page";

export const Route = createFileRoute("/game/$game/collection/$collection")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: MarketplaceItemsPage,
  staticData: {
    hasOwnTemplate: true,
  },
});
