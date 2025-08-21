import { useCollections } from "@/hooks/collections";
import { Collections } from "./collections";
import { Tokens } from "./tokens";
import { useTokens } from "@/hooks/tokens";
// New TanStack Query imports (commented out until fully integrated)
// import { useBalancesQuery, useCreditsQuery } from "@/queries/tokens";
// import { useCollectionsQuery, useCollectiblesQuery } from "@/queries/inventory";

export const Inventory = () => {
  // TODO: Replace with new TanStack Query implementation below
  const { tokens, credits, status: tokensStatus } = useTokens();
  const { collections, status: collectionsStatus } = useCollections();
  
  // New TanStack Query usage example (uncomment to use):
  /*
  const address = "0x..."; // Get from user context
  const projects = ["project1", "project2"]; // Get from arcade context
  
  // Token queries
  const { data: balancesData, isLoading: balancesLoading } = useBalancesQuery(address, projects);
  const { data: creditsData, isLoading: creditsLoading } = useCreditsQuery(address);
  
  // Collection queries
  const { data: collectionsData, isLoading: collectionsLoading } = useCollectionsQuery(address, projects);
  const { data: collectiblesData, isLoading: collectiblesLoading } = useCollectiblesQuery(address, projects);
  
  // Transform data to match expected format
  const tokens = balancesData?.balances || [];
  const credits = creditsData || null;
  const collections = [...(collectionsData?.collections || []), ...(collectiblesData?.collectibles || [])];
  
  const tokensStatus = (balancesLoading || creditsLoading) ? "loading" : "success";
  const collectionsStatus = (collectionsLoading || collectiblesLoading) ? "loading" : "success";
  */

  return (
    <div className="w-full flex flex-col gap-4 py-3 lg:py-6 rounded">
      <Tokens tokens={tokens} credits={credits} status={tokensStatus} />
      <Collections collections={collections} status={collectionsStatus} />
    </div>
  );
};
