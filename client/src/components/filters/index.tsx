import { useMetadataFiltersAdapter } from "@/hooks/use-metadata-filters-adapter";
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

export const Filters = () => {
  const {
    active,
    setActive,
    filteredMetadata,
    clearable,
    addSelected,
    isActive,
    resetSelected,
    precomputedAttributes,
    precomputedProperties,
  } = useMetadataFiltersAdapter();
  const [search, setSearch] = useState<{ [key: string]: string }>({});

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
          filteredMetadata.find(
            (m) => m.trait_type === attribute && m.value === prop.property,
          )?.tokens.length || 0,
      }));
    };
  }, [precomputedProperties, filteredMetadata, search]);

  const clear = useCallback(() => {
    resetSelected();
    setSearch({});
  }, [resetSelected, setSearch]);

  return (
    <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden">
      <MarketplaceHeader label="Status" />
      <div className="flex flex-col gap-2 w-fit">
        <MarketplaceRadialItem
          label="Buy Now"
          active={active === 0}
          onClick={() => setActive(0)}
        />
        <MarketplaceRadialItem
          label="Show All"
          active={active === 1}
          onClick={() => setActive(1)}
        />
      </div>
      <MarketplaceHeader label="Properties">
        {clearable && <MarketplaceHeaderReset onClick={clear} />}
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
                        addSelected(attribute, property, value)
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
