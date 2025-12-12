import { useEffect } from "react";
import { createPortal } from "react-dom";
import { SearchInput } from "@/components/ui/modules/search-input";
import type { GroupedSearchResults } from "@/features/search/types";
import { SearchResultItemComponent } from "@/features/search/SearchResultItem";

interface SearchOverlayProps {
  isOpen: boolean;
  query: string;
  results: GroupedSearchResults;
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}

export function SearchOverlay({
  isOpen,
  query,
  results,
  isLoading,
  onQueryChange,
  onClose,
}: SearchOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sortedItems = Object.values(results)
    .flat()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return createPortal(
    <div
      data-open={isOpen}
      className="fixed inset-0 z-50 bg-spacer-100 flex flex-col transition-transform duration-300 ease-out data-[open=false]:-translate-y-full data-[open=true]:translate-y-0 data-[open=false]:pointer-events-none"
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={onQueryChange}
            placeholder="Search tokens, games, players..."
            className="pl-9 bg-spacer-100 border border-primary-200"
            autoFocus
          />
        </div>
        <button
          className="bg-background-100 text-foreground-300 px-[16px] py-[10px] rounded-md text-sm"
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
      </div>
      <div className="flex-1 bg-background-100 border-t border-background-200 overflow-hidden">
        <div className="h-full bg-spacer-100 rounded p-3 shadow-md overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="p-3 text-foreground-400 text-sm">Searching...</div>
          ) : sortedItems.length === 0 ? (
            <div className="p-3 text-foreground-400 text-sm">
              {query.length > 0 ? "No results found" : "Start typing to search"}
            </div>
          ) : (
            <div className="flex flex-col gap-px">
              {sortedItems.map((item) => (
                <SearchResultItemComponent
                  key={`${item.type}-${item.id}`}
                  item={item}
                  query={query}
                  onClick={onClose}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
