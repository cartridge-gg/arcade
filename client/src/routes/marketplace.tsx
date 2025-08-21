import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceScene } from "@/components/scenes/marketplace";
import { MarketplaceLoading } from "@/components/errors";
import { queryClient } from "@/queries";
import { queryKeys } from "@/queries/keys";
import { fetchGames, fetchEditions } from "@/queries/games/registry";
import { constants } from "starknet";

export const Route = createFileRoute("/marketplace")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  loader: async () => {
    console.log('Marketplace route loader starting...');
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
      // Note: Market collections depend on clients from context
      // Will be fetched in component after mount
    ];
    
    // Wait for data to be ready
    await Promise.all(promises);
    console.log('Marketplace route loader completed');
    return {};
  },
  pendingMs: 0, // Show pending component immediately
  pendingMinMs: 500, // Keep it visible for at least 500ms
  component: MarketplaceScene,
  pendingComponent: MarketplaceLoading,
});
