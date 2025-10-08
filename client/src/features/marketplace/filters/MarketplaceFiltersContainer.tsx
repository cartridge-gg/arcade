import { useMemo } from "react";
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
  } = useMarketplaceFiltersViewModel();

  const viewAttributes = useMemo(() => {
    return attributes.map((attribute) => ({
      name: attribute.name,
      properties: attribute.properties.map((property) => ({
        property: property.property,
        count: property.count,
        order: property.order,
        isActive: property.isActive,
      })),
      search: attribute.search,
    }));
  }, [attributes]);

  return (
    <MarketplaceFiltersView
      statusFilter={statusFilter}
      onStatusChange={setStatusFilter}
      attributes={viewAttributes}
      hasActiveFilters={hasActiveFilters}
      onClearAll={clearAllFilters}
      onToggleProperty={setFilter}
      onSearchChange={setSearchValue}
    />
  );
};
