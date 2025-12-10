import type { SearchViewModel } from "@/features/search/useSearchViewModel";
import { SearchInput } from "@/components/ui/modules/search-input";
import { SearchResultsDropdown } from "@/features/search/SearchResultsDropdown";
import { SearchOverlay } from "./SearchOverlay";
import { Popover, PopoverAnchor } from "@cartridge/ui";

export const SearchView = ({
  disabled,
  searchValue,
  placeholder,
  isOpen,
  isOverlayOpen,
  isLoading,
  results,
  onSearchChange,
  onFocus,
  onBlur,
  onClear,
  onOverlayClose,
  onKeyDown,
}: SearchViewModel) => {
  if (disabled) return null;

  return (
    <>
      <Popover open={isOpen}>
        <PopoverAnchor asChild>
          <div className="w-[40px] lg:w-auto" onClick={onFocus}>
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={placeholder}
              disabled={disabled}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
            />
          </div>
        </PopoverAnchor>
        <SearchResultsDropdown
          results={results}
          isLoading={isLoading}
          query={searchValue}
          onClick={onClear}
        />
      </Popover>
      <SearchOverlay
        isOpen={isOverlayOpen}
        query={searchValue}
        results={results}
        isLoading={isLoading}
        onQueryChange={onSearchChange}
        onClose={onOverlayClose}
      />
    </>
  );
};
