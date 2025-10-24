import { createFileRoute } from "@tanstack/react-router";
import { ActivityScene } from "@/components/scenes/activity";

export const Route = createFileRoute("/player/$player/activity")({
  component: ActivityScene,
});
