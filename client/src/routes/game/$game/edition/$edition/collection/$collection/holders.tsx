import { createFileRoute } from "@tanstack/react-router";
import { HoldersScene } from "@/components/scenes/holders";

export const Route = createFileRoute(
  "/game/$game/edition/$edition/collection/$collection/holders",
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: HoldersScene,
});
