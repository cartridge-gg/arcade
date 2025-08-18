import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$game/edition/$edition/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/game/$game/edition/$edition/activity",
      params,
      search,
    });
  },
});