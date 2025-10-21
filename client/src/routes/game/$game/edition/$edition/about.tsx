import { AboutScene } from "@/components/scenes/about";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game/edition/$edition/about")({
  component: AboutScene,
});
