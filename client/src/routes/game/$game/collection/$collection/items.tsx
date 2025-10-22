import { createFileRoute } from "@tanstack/react-router";
import { ItemsScene } from "@/components/scenes/items";

export const Route = createFileRoute(
  "/game/$game/collection/$collection/items",
)({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: ItemsScene,
});
