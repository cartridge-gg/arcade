import { createFileRoute } from "@tanstack/react-router"
import { App } from "@/components/app";
import { createOptimizedRoute } from "@/lib/router";

export const Route = createOptimizedRoute("/player/$player")({
  component: App,
});
