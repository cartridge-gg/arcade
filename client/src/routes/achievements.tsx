import { createFileRoute } from "@tanstack/react-router"
import { AchievementScene } from "@/components/scenes/achievement";
import { createSimpleRoute } from "@/lib/router";

export const Route = createSimpleRoute("/achievements")({
  component: AchievementScene,
});