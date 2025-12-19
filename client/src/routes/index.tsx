import { createFileRoute } from "@tanstack/react-router";
import { DashboardScene } from "@/components/scenes/dashboard";

export const Route = createFileRoute("/")({
  component: DashboardScene,
});
