import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/player/$player")({
  component: Outlet,
});
