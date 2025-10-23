import { useTokens } from "@/hooks/tokens";
import { useTokenContracts } from "@/collections";
import { InventoryTokensView } from "@/components/ui/inventory/InventoryTokensView";
import { InventoryCollectionsView } from "@/components/ui/inventory/InventoryCollectionsView";
import { useInventoryTokensViewModel } from "@/features/inventory/tokens/useInventoryTokensViewModel";
import { useInventoryCollectionsViewModel } from "@/features/inventory/collections/useInventoryCollectionsViewModel";

export const InventoryContainer = () => {
  const { tokens, credits, status: tokensStatus } = useTokens();
  const { data: collections, status: collectionsStatus } = useTokenContracts();

  const tokensViewModel = useInventoryTokensViewModel({
    tokens,
    credits,
    status: tokensStatus,
  });

  const collectionsViewModel = useInventoryCollectionsViewModel({
    collections,
    status: collectionsStatus,
  });

  return (
    <div className="w-full flex flex-col gap-4 rounded">
      <InventoryTokensView {...tokensViewModel} />
      <InventoryCollectionsView {...collectionsViewModel} />
    </div>
  );
};
