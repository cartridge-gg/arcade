import { useCallback, useState } from "react";

export interface SearchViewModel {
  disabled: boolean;
  searchValue: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
}

type SearchViewModelProps = {
  disabled: boolean;
};

export function useSearchViewModel({
  disabled,
}: SearchViewModelProps): SearchViewModel {
  const [searchValue, setSearchValue] = useState("");

  const onSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return {
    disabled,
    searchValue,
    placeholder: "Search",
    onSearchChange,
  } satisfies SearchViewModel;
}
