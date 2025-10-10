import type { EditionModel } from "@cartridge/arcade";
import { useRouterState } from "@tanstack/react-router";
import {
  CollectionsGrid,
  CollectionsGridEmptyState,
  CollectionsGridLoadingState,
} from "@/components/ui/marketplace/CollectionsGrid";
import { useMarketplaceCollectionsViewModel } from "./useMarketplaceCollectionsViewModel";

interface MarketplaceCollectionsContainerProps {
  edition?: EditionModel;
}

export const MarketplaceCollectionsContainer = ({
  edition,
}: MarketplaceCollectionsContainerProps) => {
  const { location } = useRouterState();
  const { items, isLoading, isEmpty } = useMarketplaceCollectionsViewModel({
    edition,
    currentPathname: location.pathname,
  });

  if (isLoading) {
    return <CollectionsGridLoadingState />;
  }

  if (isEmpty) {
    return <CollectionsGridEmptyState />;
  }

  return <CollectionsGrid items={items} />;
};
