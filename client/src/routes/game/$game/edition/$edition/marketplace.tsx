import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceScene } from "@/components/scenes/marketplace";

export const Route = createFileRoute("/game/$game/edition/$edition/marketplace")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: MarketplaceScene,
});
