import { createFileRoute } from "@tanstack/react-router";
import { ActivityScene } from "@/components/scenes/activity";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/collection/$collection/activity",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: ActivityScene,
});
