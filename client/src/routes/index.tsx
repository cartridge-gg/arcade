import { createFileRoute } from "@tanstack/react-router"
import { DiscoverScene } from "@/components/scenes/discover";
import { createSimpleRoute } from "@/lib/router";

export const Route = createSimpleRoute("/")({
  component: DiscoverScene,
});