import { createFileRoute } from "@tanstack/react-router";
import { GuildsScene } from "@/components/scenes/guild";

export const Route = createFileRoute("/game/$game/edition/$edition/guilds")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: GuildsScene,
});
