import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import { useSearch } from "@/effect/hooks/search";
import { gamesAtom, tokenContractsAtom } from "@/effect/atoms";
import { unwrapOr } from "@/effect/utils/result";
import { useDevice } from "@/hooks/device";
import type { GameModel } from "@cartridge/arcade";
import type { EnrichedTokenContract } from "@/effect/atoms/tokens";
import type { GroupedSearchResults, SearchResultItem } from "./types";
import {
  mapTableToEntityType,
  buildLink,
  buildTitle,
  buildSubtitle,
  buildImage,
  buildGameSearchItem,
} from "./utils";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export interface SearchViewModel {
  disabled: boolean;
  searchValue: string;
  placeholder: string;
  isOpen: boolean;
  isOverlayOpen: boolean;
  isLoading: boolean;
  isMobile: boolean;
  results: GroupedSearchResults;
  hasResults: boolean;
  onSearchChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClear: () => void;
  onOverlayClose: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

type SearchViewModelProps = {
  disabled: boolean;
};

export function useSearchViewModel({
  disabled,
}: SearchViewModelProps): SearchViewModel {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isMobile } = useDevice();

  const { data, isLoading } = useSearch({
    query: debouncedQuery,
    limit: 20,
  });

  const gamesResult = useAtomValue(gamesAtom);
  const games = unwrapOr(gamesResult, [] as GameModel[]);

  const tokenContractsResult = useAtomValue(tokenContractsAtom);
  const tokenContracts = unwrapOr(
    tokenContractsResult,
    [] as EnrichedTokenContract[],
  );

  const collectionImageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const contract of tokenContracts) {
      if (contract.image) {
        map.set(contract.contract_address.toLowerCase(), contract.image);
      }
    }
    return map;
  }, [tokenContracts]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchValue.length >= MIN_QUERY_LENGTH) {
      debounceRef.current = setTimeout(() => {
        setDebouncedQuery(searchValue);
      }, DEBOUNCE_MS);
    } else {
      setDebouncedQuery("");
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue]);

  const gameResults = useMemo<SearchResultItem[]>(() => {
    if (!debouncedQuery || debouncedQuery.length < MIN_QUERY_LENGTH) return [];
    const query = debouncedQuery.toLowerCase();
    return games
      .filter((game) => game.name?.toLowerCase().includes(query))
      .map((game) => buildGameSearchItem(game, debouncedQuery))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [games, debouncedQuery]);

  const results = useMemo<GroupedSearchResults>(() => {
    const grouped: GroupedSearchResults = {
      games: gameResults,
      collections: [],
      players: [],
    };

    if (!data?.results) return grouped;

    for (const tableResult of data.results) {
      const entityType = mapTableToEntityType(tableResult.table);
      if (!entityType) continue;

      for (const match of tableResult.matches) {
        const item: SearchResultItem = {
          id: match.id,
          type: entityType,
          title: buildTitle(entityType, match.fields),
          subtitle: buildSubtitle(entityType, match.fields),
          image: buildImage(
            entityType,
            match.id,
            match.fields,
            collectionImageMap,
          ),
          link: buildLink(entityType, match.id, match.fields),
          score: match.score,
        };
        grouped[`${entityType}s` as keyof GroupedSearchResults].push(item);
      }
    }

    return grouped;
  }, [data, gameResults, collectionImageMap]);

  const hasResults = useMemo(() => {
    return Object.values(results).some((arr) => arr.length > 0);
  }, [results]);

  const onSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    if (value.length >= MIN_QUERY_LENGTH) {
      setIsOpen(true);
    }
  }, []);

  const onFocus = useCallback(() => {
    if (isMobile) {
      setIsOverlayOpen(true);
      return;
    }
    if (searchValue.length >= MIN_QUERY_LENGTH) {
      setIsOpen(true);
    }
  }, [searchValue, isMobile]);

  const onBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const onClear = useCallback(() => {
    setSearchValue("");
    setDebouncedQuery("");
    setIsOpen(false);
  }, []);

  const onOverlayClose = useCallback(() => {
    setIsOverlayOpen(false);
    setSearchValue("");
    setDebouncedQuery("");
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setIsOverlayOpen(false);
    }
  }, []);

  return {
    disabled,
    searchValue,
    placeholder: "Search tokens, games, players...",
    isOpen: isOpen && !isMobile && searchValue.length >= MIN_QUERY_LENGTH,
    isOverlayOpen,
    isLoading,
    isMobile,
    results,
    hasResults,
    onSearchChange,
    onFocus,
    onBlur,
    onClear,
    onOverlayClose,
    onKeyDown,
  } satisfies SearchViewModel;
}
