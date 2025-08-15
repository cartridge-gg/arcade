import { App } from "@/components/app";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/player/$player")({
  component: App,
});
