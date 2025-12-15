import { memo, useMemo } from "react";
import { PopoverContent } from "@cartridge/ui";
import type { GroupedSearchResults } from "./types";
import { SearchResultItemComponent } from "./SearchResultItem";

interface SearchResultsDropdownProps {
  results: GroupedSearchResults;
  isLoading: boolean;
  query: string;
  onClick?: () => void;
}

const TYPE_ORDER = { game: 0, collection: 1, player: 2 } as const;

const SearchResultsContent = memo(function SearchResultsContent({
  results,
  isLoading,
  query,
  onClick,
}: SearchResultsDropdownProps) {
  const sortedItems = useMemo(() => {
    return [...results.games, ...results.collections, ...results.players].sort(
      (a, b) => {
        const typeDiff = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
        if (typeDiff !== 0) return typeDiff;
        return (b.score ?? 0) - (a.score ?? 0);
      },
    );
  }, [results]);

  if (isLoading) {
    return <div className="text-foreground-400 text-sm">Searching...</div>;
  }

  if (sortedItems.length === 0) {
    return <div className="text-foreground-400 text-sm">No results found</div>;
  }

  return (
    <>
      {sortedItems.map((item) => (
        <SearchResultItemComponent
          key={`${item.type}-${item.id}`}
          item={item}
          query={query}
          onClick={onClick}
        />
      ))}
    </>
  );
});

export const SearchResultsDropdown = memo(function SearchResultsDropdown({
  results,
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
        results={results}
        isLoading={isLoading}
        query={query}
        onClick={onClick}
      />
    </PopoverContent>
  );
});
