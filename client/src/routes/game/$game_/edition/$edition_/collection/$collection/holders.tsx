import { createFileRoute } from "@tanstack/react-router";
import { HoldersScene } from "@/components/scenes/holders";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/collection/$collection/holders",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: HoldersScene,
});
