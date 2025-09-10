import { App } from "@/components/app";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game/player/$player")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: App,
});
