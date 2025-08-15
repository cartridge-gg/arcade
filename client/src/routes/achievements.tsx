import { createFileRoute } from "@tanstack/react-router";
import { AchievementScene } from "@/components/scenes/achievement";

export const Route = createFileRoute("/achievements")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: AchievementScene,
});
