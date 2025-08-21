import { createFileRoute } from "@tanstack/react-router";
import { DiscoverScene } from "@/components/scenes/discover";
import { DiscoverLoading } from "@/components/errors";

export const Route = createFileRoute("/activity")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: DiscoverScene,
  pendingComponent: DiscoverLoading,
});
