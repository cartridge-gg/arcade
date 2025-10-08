import { createFileRoute } from "@tanstack/react-router";
import { MarketPage } from "@/components/pages/market";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/collection/$collection/activity",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: MarketPage,
});
