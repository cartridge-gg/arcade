import {
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyEmpty,
  MarketplacePropertyFilter,
  MarketplacePropertyHeader,
  MarketplaceRadialItem,
  MarketplaceSearchEngine,
} from "@cartridge/ui";
import { useCallback, useMemo, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useRouterState } from "@tanstack/react-router";
import { useMetadataFilters } from "@/hooks/use-metadata-filters";
import { useProject } from "@/hooks/project";
import { useMarketplaceTokensStore } from "@/store";
import { DEFAULT_PROJECT } from "@/constants";

export const Filters = () => {
  const { collection: collectionAddress } = useProject();
  const getTokens = useMarketplaceTokensStore((state) => state.getTokens);
  const tokens = getTokens(DEFAULT_PROJECT, collectionAddress ?? "");

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

  const precomputedAttributes = precomputed?.attributes ?? [];
  const precomputedProperties = precomputed?.properties ?? {};
  const [search, setSearch] = useState<{ [key: string]: string }>({});
  const { trackEvent, events } = useAnalytics();
  const { location } = useRouterState();

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // Build filtered properties with search and dynamic counts
  const getFilteredProperties = useMemo(() => {
    return (attribute: string) => {
      const precomputedProps = precomputedProperties[attribute] || [];
      const searchTerm = search[attribute]?.toLowerCase() || "";

      // Filter by search term
      const filtered = searchTerm
        ? precomputedProps.filter((prop) =>
            prop.property.toLowerCase().includes(searchTerm),
          )
        : precomputedProps;

      // Add dynamic count from filtered metadata
      return filtered.map((prop) => ({
        property: prop.property,
        order: prop.order,
        count:
          availableFilters[attribute]?.[prop.property] !== undefined
            ? availableFilters[attribute][prop.property]
            : 0,
      }));
    };
  }, [precomputedProperties, availableFilters, search]);

  const handleAddSelected = useCallback(
    (attribute: string, property: string, value: boolean) => {
      const isAlreadyActive = activeFilters[attribute]?.has(property) ?? false;

      if (value && !isAlreadyActive) {
        setFilter(attribute, property);
      } else if (!value && isAlreadyActive) {
        removeFilter(attribute, property);
      }

      // Track filter application
      trackEvent(events.MARKETPLACE_FILTER_APPLIED, {
        filter_type: attribute,
        filter_value: property,
        filter_enabled: value,
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

  const clear = useCallback(() => {
    clearAllFilters();
    setSearch({});
  }, [clearAllFilters, setSearch]);

  const isActive = useCallback(
    (attribute: string, property: string) => {
      return activeFilters[attribute]?.has(property) ?? false;
    },
    [activeFilters],
  );

  return (
    <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden">
      <MarketplaceHeader label="Status" />
      <div className="flex flex-col gap-2 w-fit">
        <MarketplaceRadialItem
          label="Buy Now"
          active={statusFilter === "listed"}
          onClick={() => setStatusFilter("listed")}
        />
        <MarketplaceRadialItem
          label="Show All"
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
      </div>
      <MarketplaceHeader label="Properties">
        {hasActiveFilters && <MarketplaceHeaderReset onClick={clear} />}
      </MarketplaceHeader>
      <div
        className="h-full flex flex-col gap-2 overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {precomputedAttributes.map((attribute, index) => {
          const properties = getFilteredProperties(attribute);
          return (
            <MarketplacePropertyHeader
              key={index}
              label={attribute}
              count={properties.length}
            >
              <MarketplaceSearchEngine
                variant="darkest"
                search={search[attribute] || ""}
                setSearch={(value: string) =>
                  setSearch((prev) => ({ ...prev, [attribute]: value }))
                }
              />
              <div className="flex flex-col gap-px">
                {properties
                  .sort((a, b) => b.order - a.order)
                  .map(({ property, count }, index) => (
                    <MarketplacePropertyFilter
                      key={`${attribute}-${property}-${index}`}
                      label={property}
                      count={count}
                      disabled={count === 0 && !isActive(attribute, property)}
                      value={isActive(attribute, property)}
                      setValue={(value: boolean) =>
                        handleAddSelected(attribute, property, value)
                      }
                    />
                  ))}
                {properties.length === 0 && <MarketplacePropertyEmpty />}
              </div>
            </MarketplacePropertyHeader>
          );
        })}
      </div>
    </MarketplaceFilters>
  );
};
