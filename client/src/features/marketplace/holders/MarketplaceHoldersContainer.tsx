import { Empty } from "@cartridge/ui";
import type { EditionModel } from "@cartridge/arcade";
import {
  HoldersEmptyState,
  HoldersFilteredEmptyState,
  HoldersLoadingState,
  HoldersView,
} from "@/components/ui/marketplace/HoldersView";
import { useMarketplaceHoldersViewModel } from "./useMarketplaceHoldersViewModel";

interface MarketplaceHoldersContainerProps {
  edition: EditionModel;
  collectionAddress: string;
}

export const MarketplaceHoldersContainer = ({
  edition,
  collectionAddress,
}: MarketplaceHoldersContainerProps) => {
  const {
    displayedOwners,
    hasActiveFilters,
    totalOwners,
    filteredOwnersCount,
    isInitialLoading,
    isEmpty,
    isFilteredResultEmpty,
    isLoadingMore,
    editionError,
    loadingProgress,
    clearAllFilters,
  } = useMarketplaceHoldersViewModel({ edition, collectionAddress });

  if (isInitialLoading) {
    return <HoldersLoadingState />;
  }

  if (editionError.length > 0) {
    return (
      <Empty
        title={`Failed to load holders data from ${editionError[0].attributes.preset} torii`}
        className="h-full"
      />
    );
  }

  if (isEmpty) {
    return <HoldersEmptyState />;
  }

  if (isFilteredResultEmpty) {
    return (
      <HoldersFilteredEmptyState
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />
    );
  }

  return (
    <HoldersView
      owners={displayedOwners}
      hasActiveFilters={hasActiveFilters}
      totalOwners={totalOwners}
      filteredOwnersCount={filteredOwnersCount}
      onClearFilters={clearAllFilters}
      isLoadingMore={isLoadingMore}
      loadingProgress={loadingProgress}
    />
  );
};
