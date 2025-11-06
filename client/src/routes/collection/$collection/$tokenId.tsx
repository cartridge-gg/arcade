import { createFileRoute } from "@tanstack/react-router";
import { TokenDetailScene } from "@/components/scenes/token-detail";

export const Route = createFileRoute("/collection/$collection/$tokenId")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: TokenDetailScene,
});
