import { useCallback } from "react";
import { MarketplaceFiltersView } from "@/components/ui/marketplace/MarketplaceFiltersView";
import { useMarketplaceFiltersViewModel } from "./useMarketplaceFiltersViewModel";

export const MarketplaceFiltersContainer = () => {
  const {
    statusFilter,
    setStatusFilter,
    attributes,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
    setSearchValue,
    onAttributeExpand,
    isSummaryLoading,
    ownerInput,
    ownerSuggestions,
    isOwnerAddressInput,
    onOwnerInputChange,
    onOwnerSelectSuggestion,
    onClearOwner,
  } = useMarketplaceFiltersViewModel();

  const handleListedClick = useCallback(
    () => setStatusFilter("listed"),
    [setStatusFilter],
  );
  const handleAllClick = useCallback(
    () => setStatusFilter("all"),
    [setStatusFilter],
  );

  return (
    <MarketplaceFiltersView
      statusFilter={statusFilter}
      onListedClick={handleListedClick}
      onAllClick={handleAllClick}
      attributes={attributes}
      hasActiveFilters={hasActiveFilters}
      onClearAll={clearAllFilters}
      onToggleProperty={setFilter}
      onSearchChange={setSearchValue}
      onAttributeExpand={onAttributeExpand}
      isSummaryLoading={isSummaryLoading}
      ownerInput={ownerInput}
      ownerSuggestions={ownerSuggestions}
      isOwnerAddressInput={isOwnerAddressInput}
      onOwnerInputChange={onOwnerInputChange}
      onOwnerSelectSuggestion={onOwnerSelectSuggestion}
      onClearOwner={onClearOwner}
    />
  );
};
