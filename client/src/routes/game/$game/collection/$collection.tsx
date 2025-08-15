import { ItemsScene } from "@/components/scenes/items";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game/collection/$collection")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: ItemsScene,
});
