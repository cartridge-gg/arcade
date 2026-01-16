import { memo } from "react";
import {
  cn,
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyEmpty,
  MarketplaceRadialItem,
} from "@cartridge/ui";
import { AttributeSection, OwnerFilterSection } from "./filters";
import type {
  MarketplaceFilterAttribute,
  MarketplaceFilterProperty,
} from "@/features/marketplace/filters/useMarketplaceFiltersViewModel";
import type { Account } from "@/effect/atoms";

export type MarketplaceFilterPropertyView = MarketplaceFilterProperty;
export type MarketplaceFilterAttributeView = MarketplaceFilterAttribute;

interface MarketplaceFiltersViewProps {
  statusFilter: "all" | "listed";
  onListedClick: () => void;
  onAllClick: () => void;
  attributes: MarketplaceFilterAttributeView[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onToggleProperty: (
    attribute: string,
    property: string,
    enabled: boolean,
  ) => void;
  onSearchChange: (attribute: string, value: string) => void;
  onAttributeExpand: (attribute: string, expanded: boolean) => void;
  isSummaryLoading?: boolean;
  isInventory: boolean;
  ownerInput: string;
  ownerSuggestions: Account[];
  isOwnerAddressInput: boolean;
  onOwnerInputChange: (value: string) => void;
  onOwnerSelectSuggestion: (account: Account) => void;
  onClearOwner: () => void;
}

export const MarketplaceFiltersView = memo(
  ({
    statusFilter,
    onListedClick,
    onAllClick,
    attributes,
    hasActiveFilters,
    onClearAll,
    onToggleProperty,
    onSearchChange,
    onAttributeExpand,
    isSummaryLoading,
    isInventory,
    ownerInput,
    ownerSuggestions,
    isOwnerAddressInput,
    onOwnerInputChange,
    onOwnerSelectSuggestion,
    onClearOwner,
  }: MarketplaceFiltersViewProps) => {
    return (
      <MarketplaceFilters
        className={cn(
          "h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden",
          "lg:rounded-xl",
        )}
      >
        <MarketplaceHeader label="Status" />
        <div className="flex flex-col gap-2 w-fit">
          <MarketplaceRadialItem
            label="Buy Now"
            active={statusFilter === "listed"}
            onClick={onListedClick}
          />
          <MarketplaceRadialItem
            label="Show All"
            active={statusFilter === "all"}
            onClick={onAllClick}
          />
        </div>
        {!isInventory && (
          <>
            <MarketplaceHeader label="Owner" />
            <OwnerFilterSection
              inputValue={ownerInput}
              onInputChange={onOwnerInputChange}
              suggestions={ownerSuggestions}
              isAddressInput={isOwnerAddressInput}
              onSelectSuggestion={onOwnerSelectSuggestion}
              onClear={onClearOwner}
            />
          </>
        )}
        <MarketplaceHeader label="Properties">
          {hasActiveFilters && <MarketplaceHeaderReset onClick={onClearAll} />}
        </MarketplaceHeader>
        <div
          className="h-full flex flex-col gap-2 overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          {isSummaryLoading ? (
            <MarketplaceFiltersEmptyState />
          ) : attributes.length === 0 ? (
            <MarketplaceFiltersEmptyState />
          ) : (
            attributes.map((attribute) => (
              <AttributeSection
                key={attribute.name}
                attribute={attribute}
                onToggleProperty={onToggleProperty}
                onSearchChange={onSearchChange}
                onExpand={onAttributeExpand}
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
