import type { SearchViewModel } from "@/features/search/useSearchViewModel";
import { SearchInput } from "@/components/ui/modules/search-input";

export const SearchView = ({
  disabled,
  searchValue,
  placeholder,
  onSearchChange,
}: SearchViewModel) => {
  if (disabled) return null;
  return (
    <div className="w-1/6">
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};
