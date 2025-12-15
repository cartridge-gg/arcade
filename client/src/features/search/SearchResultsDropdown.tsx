import { memo } from "react";
import { PopoverContent } from "@cartridge/ui";
import type { SearchResultItem } from "./types";
import { SearchResultItemComponent } from "./SearchResultItem";

interface SearchResultsDropdownProps {
  sortedItems: SearchResultItem[];
  selectedIndex: number;
  isLoading: boolean;
  query: string;
  onClick?: () => void;
}

const SearchResultsContent = memo(function SearchResultsContent({
  sortedItems,
  selectedIndex,
  isLoading,
  query,
  onClick,
}: SearchResultsDropdownProps) {
  if (isLoading) {
    return <div className="text-foreground-400 text-sm">Searching...</div>;
  }

  if (sortedItems.length === 0) {
    return <div className="text-foreground-400 text-sm">No results found</div>;
  }

  return (
    <>
      {sortedItems.map((item, index) => (
        <SearchResultItemComponent
          key={`${item.type}-${item.id}`}
          item={item}
          query={query}
          isSelected={index === selectedIndex}
          onClick={onClick}
        />
      ))}
    </>
  );
});

export const SearchResultsDropdown = memo(function SearchResultsDropdown({
  sortedItems,
  selectedIndex,
  isLoading,
  query,
  onClick,
}: SearchResultsDropdownProps) {
  return (
    <PopoverContent
      className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-scroll w-[var(--radix-popover-trigger-width)] max-h-96 bg-background-100 border border-background-200 flex flex-col p-0"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <SearchResultsContent
        sortedItems={sortedItems}
        selectedIndex={selectedIndex}
        isLoading={isLoading}
        query={query}
        onClick={onClick}
      />
    </PopoverContent>
  );
});
