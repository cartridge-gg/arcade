import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game_/player/$player")({
  component: Outlet,
});
