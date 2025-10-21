import { createFileRoute } from "@tanstack/react-router";
import { ActivityScene } from "@/components/scenes/activity";

export const Route = createFileRoute("/game/$game/edition/$edition/activity")({
  component: ActivityScene,
});
