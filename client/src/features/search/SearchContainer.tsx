import { SearchView } from "@/components/ui/search/SearchView";
import { useSearchViewModel } from "./useSearchViewModel";

export const SearchContainer = () => {
  const viewModel = useSearchViewModel({
    disabled: process.env.NODE_ENV !== "development",
  });
  return <SearchView {...viewModel} />;
};
