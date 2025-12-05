import { Empty } from "@cartridge/ui";
import {
  HoldersEmptyState,
  HoldersFilteredEmptyState,
  HoldersLoadingState,
  HoldersView,
} from "@/components/ui/marketplace/HoldersView";
import { useMarketplaceHoldersViewModel } from "./useMarketplaceHoldersViewModel";

interface MarketplaceHoldersContainerProps {
  collectionAddress: string;
}

export const MarketplaceHoldersContainer = ({
  collectionAddress,
}: MarketplaceHoldersContainerProps) => {
  const {
    displayedHolders,
    hasActiveFilters,
    totalHolders,
    filteredHoldersCount,
    isInitialLoading,
    isEmpty,
    isFilteredResultEmpty,
    isLoadingMore,
    editionError,
    clearAllFilters,
  } = useMarketplaceHoldersViewModel({ collectionAddress });

  if (isInitialLoading) {
    return <HoldersLoadingState />;
  }

  if (editionError.length > 0) {
    return (
      <Empty
        title={`Failed to load holders data from ${editionError[0].attributes.preset} torii`}
        className="h-full lg:order-3"
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
      holders={displayedHolders}
      hasActiveFilters={hasActiveFilters}
      totalHolders={totalHolders}
      filteredHoldersCount={filteredHoldersCount}
      onClearFilters={clearAllFilters}
      isLoadingMore={isLoadingMore}
    />
  );
};
