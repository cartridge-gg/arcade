import { createFileRoute } from "@tanstack/react-router";
import { DiscoverScene } from "@/components/scenes/discover";

export const Route = createFileRoute("/activity")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: DiscoverScene,
});
