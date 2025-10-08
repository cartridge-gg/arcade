import { useCallback, useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useProject } from "@/hooks/project";
import { useMarketplaceTokensStore } from "@/store";
import { DEFAULT_PROJECT } from "@/constants";
import { useMetadataFilters } from "@/hooks/use-metadata-filters";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface MarketplaceFilterProperty {
  property: string;
  order: number;
  count: number;
  isActive: boolean;
}

export interface MarketplaceFilterAttribute {
  name: string;
  properties: MarketplaceFilterProperty[];
  search: string;
}

export interface MarketplaceFiltersViewModel {
  statusFilter: "all" | "listed";
  setStatusFilter: (value: "all" | "listed") => void;
  attributes: MarketplaceFilterAttribute[];
  hasActiveFilters: boolean;
  setFilter: (attribute: string, property: string, enabled: boolean) => void;
  clearAllFilters: () => void;
  searchValue: Record<string, string>;
  setSearchValue: (attribute: string, value: string) => void;
}

export function useMarketplaceFiltersViewModel(): MarketplaceFiltersViewModel {
  const { collection: collectionAddress } = useProject();
  const getTokens = useMarketplaceTokensStore((state) => state.getTokens);
  const tokens = getTokens(DEFAULT_PROJECT, collectionAddress ?? "");
  const { trackEvent, events } = useAnalytics();
  const { location } = useRouterState();

  const [search, setSearch] = useState<Record<string, string>>({});

  const {
    activeFilters,
    availableFilters,
    clearAllFilters,
    setFilter,
    removeFilter,
    precomputed,
    statusFilter,
    setStatusFilter,
  } = useMetadataFilters({
    tokens: tokens || [],
    collectionAddress: collectionAddress ?? "",
    enabled: !!collectionAddress && !!tokens,
  });

  const searchValue = useMemo(() => search, [search]);

  const precomputedAttributes = precomputed?.attributes ?? [];
  const precomputedProperties = precomputed?.properties ?? {};

  const attributes = useMemo(() => {
    return precomputedAttributes.map((attribute) => {
      const properties = precomputedProperties[attribute] || [];
      const searchTerm = search[attribute]?.toLowerCase() || "";

      const filtered = searchTerm
        ? properties.filter((prop) =>
            prop.property.toLowerCase().includes(searchTerm),
          )
        : properties;

      const enriched = filtered.map((prop) => ({
        property: prop.property,
        order: prop.order,
        count: availableFilters[attribute]?.[prop.property] ?? 0,
        isActive: activeFilters[attribute]?.has(prop.property) ?? false,
      }));

      return {
        name: attribute,
        properties: enriched,
        search: search[attribute] || "",
      };
    });
  }, [
    precomputedAttributes,
    precomputedProperties,
    availableFilters,
    activeFilters,
    search,
  ]);

  const hasActiveFilters = useMemo(
    () => Object.keys(activeFilters).length > 0,
    [activeFilters],
  );

  const handleSetFilter = useCallback(
    (attribute: string, property: string, enabled: boolean) => {
      const isActive = activeFilters[attribute]?.has(property) ?? false;

      if (enabled && !isActive) {
        setFilter(attribute, property);
      } else if (!enabled) {
        removeFilter(attribute, property);
      }

      trackEvent(events.MARKETPLACE_FILTER_APPLIED, {
        filter_type: attribute,
        filter_value: property,
        filter_enabled: enabled,
        from_page: location.pathname,
      });
    },
    [
      activeFilters,
      setFilter,
      removeFilter,
      trackEvent,
      events,
      location.pathname,
    ],
  );

  const handleClearFilters = useCallback(() => {
    clearAllFilters();
    setSearch({});
  }, [clearAllFilters]);

  const setSearchValue = useCallback((attribute: string, value: string) => {
    setSearch((prev) => ({ ...prev, [attribute]: value }));
  }, []);

  return {
    statusFilter,
    setStatusFilter,
    attributes,
    hasActiveFilters,
    setFilter: handleSetFilter,
    clearAllFilters: handleClearFilters,
    searchValue,
    setSearchValue,
  };
}
