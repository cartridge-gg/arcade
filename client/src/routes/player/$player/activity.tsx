import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/app";

export const Route = createFileRoute("/player/$player/activity")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: App,
});
