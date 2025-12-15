import { memo } from "react";
import { SearchView } from "@/components/ui/search/SearchView";
import { useSearchViewModel } from "./useSearchViewModel";

export const SearchContainer = memo(() => {
  const viewModel = useSearchViewModel({
    disabled: false,
  });
  return <SearchView {...viewModel} />;
});
