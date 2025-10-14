import { createFileRoute } from "@tanstack/react-router";
import { PlayerPage } from "@/components/pages/player";

export const Route = createFileRoute("/player/$player/activity")({
  component: PlayerPage,
});
