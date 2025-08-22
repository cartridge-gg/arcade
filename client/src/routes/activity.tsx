import { createFileRoute } from "@tanstack/react-router";
import { DiscoverScene } from "@/components/scenes/discover";
import { DiscoverLoading } from "@/components/errors";
import { queryClient } from "@/queries";
import { queryKeys } from "@/queries/keys";
import { fetchGames, fetchEditions } from "@/queries/games/registry";
import { constants } from "starknet";

export const Route = createFileRoute("/activity")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  loader: async () => {
    const chainId = constants.StarknetChainId.SN_MAIN;

    // Prefetch all required data
    const promises = [
      queryClient.prefetchQuery({
        queryKey: queryKeys.games.all,
        queryFn: () => fetchGames(chainId),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.games.editions,
        queryFn: () => fetchEditions(chainId),
      }),
    ];

    // Wait for data to be ready
    await Promise.all(promises);
    return {};
  },
  pendingMs: 0, // Show pending component immediately
  pendingMinMs: 500, // Keep it visible for at least 500ms
  component: DiscoverScene,
  pendingComponent: DiscoverLoading,
});
