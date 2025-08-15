import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: () => <Outlet />,
});
