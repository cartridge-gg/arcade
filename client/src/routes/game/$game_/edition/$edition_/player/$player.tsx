import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/game/$game_/edition/$edition_/player/$player",
)({
  component: Outlet,
});
