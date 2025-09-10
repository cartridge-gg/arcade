import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/game/$game/activity",
      params,
      search,
    });
  },
});