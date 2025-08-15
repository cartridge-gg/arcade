import { createFileRoute } from "@tanstack/react-router";
import { ItemsScene } from "@/components/scenes/items";

export const Route = createFileRoute("/collection/$collection/items")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: ItemsScene,
});
