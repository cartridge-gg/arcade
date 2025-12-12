import { createFileRoute } from "@tanstack/react-router";
import { SearchResultsPage } from "@/components/ui/search/SearchResultsPage";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: search.q as string | undefined,
  }),
  component: SearchResultsPage,
});
