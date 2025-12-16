import { useCallback, useMemo, useRef, useEffect } from "react";
import { useAtom, useAtomValue } from "@effect-atom/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { useSearch } from "@/effect/hooks/search";
import { gamesAtom, tokenContractsAtom } from "@/effect/atoms";
import { searchUIAtom } from "@/effect/atoms/search";
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
  sortedItems: SearchResultItem[];
  selectedIndex: number;
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

const TYPE_ORDER = { game: 0, collection: 1, player: 2 } as const;

export function useSearchViewModel({
  disabled,
}: SearchViewModelProps): SearchViewModel {
  const [state, setState] = useAtom(searchUIAtom);
  const { searchValue, debouncedQuery, isOpen, isOverlayOpen, selectedIndex } =
    state;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isMobile } = useDevice();
  const navigate = useNavigate();

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
        setState((s) => ({ ...s, debouncedQuery: searchValue }));
      }, DEBOUNCE_MS);
    } else {
      setState((s) => ({ ...s, debouncedQuery: "" }));
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue, setState]);

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

  const sortedItems = useMemo(() => {
    return [...results.games, ...results.collections, ...results.players].sort(
      (a, b) => {
        const typeDiff = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
        if (typeDiff !== 0) return typeDiff;
        return (b.score ?? 0) - (a.score ?? 0);
      },
    );
  }, [results]);

  useEffect(() => {
    setState((s) => ({ ...s, selectedIndex: -1 }));
  }, [debouncedQuery, setState]);

  const onSearchChange = useCallback(
    (value: string) => {
      setState((s) => ({
        ...s,
        searchValue: value,
        isOpen: value.length >= MIN_QUERY_LENGTH ? true : s.isOpen,
      }));
    },
    [setState],
  );

  const onFocus = useCallback(() => {
    if (isMobile) {
      setState((s) => ({ ...s, isOverlayOpen: true }));
      return;
    }
    if (searchValue.length >= MIN_QUERY_LENGTH) {
      setState((s) => ({ ...s, isOpen: true }));
    }
  }, [searchValue, isMobile, setState]);

  const onBlur = useCallback(() => {
    setTimeout(() => setState((s) => ({ ...s, isOpen: false })), 200);
  }, [setState]);

  const onClear = useCallback(() => {
    setState((s) => ({
      ...s,
      searchValue: "",
      debouncedQuery: "",
      isOpen: false,
    }));
  }, [setState]);

  const onOverlayClose = useCallback(() => {
    setState((s) => ({
      ...s,
      isOverlayOpen: false,
      searchValue: "",
      debouncedQuery: "",
    }));
  }, [setState]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setState((s) => ({
          ...s,
          isOpen: false,
          isOverlayOpen: false,
          selectedIndex: -1,
        }));
        return;
      }

      if (!isOpen || isLoading) return;

      const itemCount = sortedItems.length;
      if (itemCount === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setState((s) => ({
          ...s,
          selectedIndex: (s.selectedIndex + 1) % itemCount,
        }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setState((s) => ({
          ...s,
          selectedIndex:
            s.selectedIndex <= 0 ? itemCount - 1 : s.selectedIndex - 1,
        }));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const item = sortedItems[selectedIndex];
        if (item) {
          navigate({ to: item.link });
          setState((s) => ({
            ...s,
            isOpen: false,
            selectedIndex: -1,
            searchValue: "",
            debouncedQuery: "",
          }));
        }
      }
    },
    [sortedItems, selectedIndex, navigate, setState, isOpen, isLoading],
  );

  return {
    disabled,
    searchValue,
    placeholder: "Search tokens, games, players...",
    isOpen: isOpen && !isMobile && searchValue.length >= MIN_QUERY_LENGTH,
    isOverlayOpen,
    isLoading,
    isMobile,
    results,
    sortedItems,
    selectedIndex,
    hasResults,
    onSearchChange,
    onFocus,
    onBlur,
    onClear,
    onOverlayClose,
    onKeyDown,
  } satisfies SearchViewModel;
}
