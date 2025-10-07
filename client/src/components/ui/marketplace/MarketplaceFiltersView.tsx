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

export interface MarketplaceFilterPropertyView {
  property: string;
  count: number;
  order: number;
  isActive: boolean;
}

export interface MarketplaceFilterAttributeView {
  name: string;
  properties: MarketplaceFilterPropertyView[];
  search: string;
}

interface MarketplaceFiltersViewProps {
  statusFilter: "all" | "listed";
  onStatusChange: (value: "all" | "listed") => void;
  attributes: MarketplaceFilterAttributeView[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onToggleProperty: (
    attribute: string,
    property: string,
    enabled: boolean,
  ) => void;
  onSearchChange: (attribute: string, value: string) => void;
}

export const MarketplaceFiltersView = ({
  statusFilter,
  onStatusChange,
  attributes,
  hasActiveFilters,
  onClearAll,
  onToggleProperty,
  onSearchChange,
}: MarketplaceFiltersViewProps) => {
  return (
    <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden">
      <MarketplaceHeader label="Status" />
      <div className="flex flex-col gap-2 w-fit">
        <MarketplaceRadialItem
          label="Buy Now"
          active={statusFilter === "listed"}
          onClick={() => onStatusChange("listed")}
        />
        <MarketplaceRadialItem
          label="Show All"
          active={statusFilter === "all"}
          onClick={() => onStatusChange("all")}
        />
      </div>
      <MarketplaceHeader label="Properties">
        {hasActiveFilters && <MarketplaceHeaderReset onClick={onClearAll} />}
      </MarketplaceHeader>
      <div
        className="h-full flex flex-col gap-2 overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {attributes.length === 0 ? (
          <MarketplaceFiltersEmptyState />
        ) : (
          attributes.map((attribute) => (
            <MarketplacePropertyHeader
              key={attribute.name}
              label={attribute.name}
              count={attribute.properties.length}
            >
              <MarketplaceSearchEngine
                variant="darkest"
                search={attribute.search}
                setSearch={(value: string) =>
                  onSearchChange(attribute.name, value)
                }
              />
              <div className="flex flex-col gap-px">
                {attribute.properties
                  .sort((a, b) => b.order - a.order)
                  .map(({ property, count, isActive }) => (
                    <MarketplacePropertyFilter
                      key={`${attribute.name}-${property}`}
                      label={property}
                      count={count}
                      disabled={count === 0 && !isActive}
                      value={isActive}
                      setValue={(enabled: boolean) =>
                        onToggleProperty(attribute.name, property, enabled)
                      }
                    />
                  ))}
                {attribute.properties.length === 0 && (
                  <MarketplacePropertyEmpty />
                )}
              </div>
            </MarketplacePropertyHeader>
          ))
        )}
      </div>
    </MarketplaceFilters>
  );
};

export const MarketplaceFiltersEmptyState = () => {
  return <MarketplacePropertyEmpty />;
};
