import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/collection/$collection")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: search.filter as string | undefined,
  }),
  component: Outlet,
});
