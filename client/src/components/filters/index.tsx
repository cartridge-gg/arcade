import { useMarketFilters } from "@/hooks/market-filters";
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
    allMetadata,
    filteredMetadata,
    clearable,
    addSelected,
    isActive,
    resetSelected,
  } = useMarketFilters();
  const [search, setSearch] = useState<{ [key: string]: string }>({});

  const { attributes, properties } = useMemo(() => {
    const attributes = Array.from(
      new Set(allMetadata.map((attribute) => attribute.trait_type)),
    ).sort();
    const properties = attributes.reduce(
      (acc, attribute) => {
        const values = allMetadata
          .filter((m) => m.trait_type === attribute)
          .map((m) => m.value);
        const props = Array.from(new Set(values))
          .sort()
          .filter((value) =>
            `${value}`
              .toLowerCase()
              .includes(search[attribute]?.toLowerCase() || ""),
          );
        acc[attribute] = props.map((prop) => ({
          property: prop,
          order:
            allMetadata.find(
              (m) => m.trait_type === attribute && m.value === prop,
            )?.tokens.length || 0,
          count:
            filteredMetadata.find(
              (m) => m.trait_type === attribute && m.value === prop,
            )?.tokens.length || 0,
        }));
        return acc;
      },
      {} as {
        [key: string]: { property: string; order: number; count: number }[];
      },
    );
    return { attributes, properties };
  }, [allMetadata, filteredMetadata, search]);

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
        {attributes.map((attribute, index) => (
          <MarketplacePropertyHeader
            key={index}
            label={attribute}
            count={properties[attribute].length}
          >
            <MarketplaceSearchEngine
              variant="darkest"
              search={search[attribute] || ""}
              setSearch={(value: string) =>
                setSearch((prev) => ({ ...prev, [attribute]: value }))
              }
            />
            <div className="flex flex-col gap-px">
              {properties[attribute]
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
              {properties[attribute].length === 0 && (
                <MarketplacePropertyEmpty />
              )}
            </div>
          </MarketplacePropertyHeader>
        ))}
      </div>
    </MarketplaceFilters>
  );
};
