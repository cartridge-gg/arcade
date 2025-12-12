import { useAtomValue } from "@effect-atom/atom-react";
import {
  searchAtom,
  type SearchOptions,
  type SearchResultsView,
} from "../atoms/search";
import { unwrapOr, toStatus, type ResultStatus } from "../utils/result";

const EMPTY_RESULTS: SearchResultsView = { total: 0, results: [] };

export const useSearch = (options: SearchOptions) => {
  const result = useAtomValue(searchAtom(options));
  const data = unwrapOr(result, EMPTY_RESULTS);
  const status = toStatus(result);
  return { data, status, isLoading: status === "pending" };
};

export type { SearchOptions, SearchResultsView, ResultStatus };
