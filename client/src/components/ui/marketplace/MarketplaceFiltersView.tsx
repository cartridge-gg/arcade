import { memo } from "react";
import {
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyEmpty,
  MarketplaceRadialItem,
} from "@cartridge/ui";
import { AttributeSection } from "./filters";

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

export const MarketplaceFiltersView = memo(
  ({
    statusFilter,
    onStatusChange,
    attributes,
    hasActiveFilters,
    onClearAll,
    onToggleProperty,
    onSearchChange,
  }: MarketplaceFiltersViewProps) => {
    return (
      <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden rounded-none lg:rounded-xl">
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
              <AttributeSection
                key={attribute.name}
                attribute={attribute}
                onToggleProperty={onToggleProperty}
                onSearchChange={onSearchChange}
              />
            ))
          )}
        </div>
      </MarketplaceFilters>
    );
  },
);

MarketplaceFiltersView.displayName = "MarketplaceFiltersView";

export const MarketplaceFiltersEmptyState = () => {
  return <MarketplacePropertyEmpty />;
};
