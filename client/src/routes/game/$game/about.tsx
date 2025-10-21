import { createFileRoute } from "@tanstack/react-router";
import { AboutScene } from "@/components/scenes/about";

export const Route = createFileRoute("/game/$game/about")({
  component: AboutScene,
});
