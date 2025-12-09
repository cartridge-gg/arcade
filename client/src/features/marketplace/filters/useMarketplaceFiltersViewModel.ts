import { useCallback, useMemo, useRef, useState } from "react";
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
  valueCount: number;
  isExpanded: boolean;
  isLoading: boolean;
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
  onAttributeExpand: (attribute: string, expanded: boolean) => void;
  isSummaryLoading: boolean;
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
    traitSummary,
    expandedTraits,
    expandTrait,
    collapseTrait,
    isLoading,
    isSummaryLoading,
  } = useMetadataFilters({
    tokens: tokens || [],
    collectionAddress: collectionAddress ?? "",
    enabled: !!collectionAddress && !!tokens,
  });

  const searchValue = useMemo(() => search, [search]);

  const activeFiltersRef = useRef(activeFilters);
  activeFiltersRef.current = activeFilters;

  const precomputedProperties = precomputed?.properties ?? {};

  const attributes = useMemo(() => {
    return traitSummary.map((summary) => {
      const attribute = summary.traitName;
      const properties = precomputedProperties[attribute] || [];
      const searchTerm = search[attribute]?.toLowerCase() || "";
      const hasActiveFilter = !!activeFilters[attribute]?.size;
      const isExpanded = expandedTraits.has(attribute) || hasActiveFilter;

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
        valueCount: summary.valueCount,
        isExpanded,
        isLoading: isExpanded && properties.length === 0 && isLoading,
      };
    });
  }, [
    traitSummary,
    precomputedProperties,
    availableFilters,
    activeFilters,
    search,
    expandedTraits,
    isLoading,
  ]);

  const hasActiveFilters = useMemo(
    () => Object.keys(activeFilters).length > 0,
    [activeFilters],
  );

  const handleSetFilter = useCallback(
    (attribute: string, property: string, enabled: boolean) => {
      const isActive =
        activeFiltersRef.current[attribute]?.has(property) ?? false;

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
    [setFilter, removeFilter, trackEvent, events, location.pathname],
  );

  const handleClearFilters = useCallback(() => {
    clearAllFilters();
    setSearch({});
  }, [clearAllFilters]);

  const setSearchValue = useCallback((attribute: string, value: string) => {
    setSearch((prev) => ({ ...prev, [attribute]: value }));
  }, []);

  const onAttributeExpand = useCallback(
    (attribute: string, expanded: boolean) => {
      if (expanded) {
        expandTrait(attribute);
      } else {
        collapseTrait(attribute);
      }
    },
    [expandTrait, collapseTrait],
  );

  return {
    statusFilter,
    setStatusFilter,
    attributes,
    hasActiveFilters,
    setFilter: handleSetFilter,
    clearAllFilters: handleClearFilters,
    searchValue,
    setSearchValue,
    onAttributeExpand,
    isSummaryLoading,
  };
}
