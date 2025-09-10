import { createFileRoute } from "@tanstack/react-router";
import { AboutScene } from "@/components/scenes/about";

export const Route = createFileRoute("/game/$game/edition/$edition/about")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: AboutScene,
});
