import { createFileRoute } from "@tanstack/react-router";
import { TokenDetailPage } from "@/components/scenes/token-detail-page";

export const Route = createFileRoute(
  "/game/$game/collection/$collection_/$tokenId",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: TokenDetailPage,
  staticData: {
    hasOwnTemplate: true,
  },
});
