import { createFileRoute } from "@tanstack/react-router";
import { GuildsScene } from "@/components/scenes/guild";

export const Route = createFileRoute("/game/$game/guilds")({
  component: GuildsScene,
});
