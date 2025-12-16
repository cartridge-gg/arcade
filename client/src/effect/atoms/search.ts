import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { ToriiGrpcClient } from "@dojoengine/react/effect";
import { toriiRuntime } from "../runtime";

export type SearchOptions = {
  query: string;
  limit?: number;
};

type SearchMatch = {
  id: string;
  fields: Record<string, string>;
  score?: number;
};

type TableSearchResults = {
  table: string;
  matches: SearchMatch[];
};

export type SearchResultsView = {
  total: number;
  results: TableSearchResults[];
};

const EMPTY_RESULTS: SearchResultsView = { total: 0, results: [] };

const fetchSearchEffect = ({ query, limit = 20 }: SearchOptions) =>
  Effect.gen(function* () {
    if (!query || query.length < 2) {
      return EMPTY_RESULTS;
    }

    const { client } = yield* ToriiGrpcClient;

    const result = yield* Effect.tryPromise(() =>
      client.search({ query, limit }),
    );

    return result as SearchResultsView;
  });

const searchFamily = Atom.family((key: string) => {
  const options: SearchOptions = JSON.parse(key);
  return toriiRuntime.atom(fetchSearchEffect(options)).pipe(Atom.keepAlive);
});

export const searchAtom = (options: SearchOptions) => {
  const key = JSON.stringify({
    query: options.query,
    limit: options.limit ?? 20,
  });
  return searchFamily(key);
};

export type SearchUIState = {
  searchValue: string;
  debouncedQuery: string;
  isOpen: boolean;
  isOverlayOpen: boolean;
  selectedIndex: number;
};

export const searchUIAtom = Atom.make<SearchUIState>({
  searchValue: "",
  debouncedQuery: "",
  isOpen: false,
  isOverlayOpen: false,
  selectedIndex: -1,
});
