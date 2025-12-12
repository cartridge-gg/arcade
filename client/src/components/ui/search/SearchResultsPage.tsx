import { useMemo, useState, useEffect, useRef } from "react";
import {
  useSearch as useRouteSearch,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useAtomValue } from "@effect-atom/atom-react";
import { useSearch } from "@/effect/hooks/search";
import { gamesAtom, tokenContractsAtom } from "@/effect/atoms";
import { unwrapOr } from "@/effect/utils/result";
import type { GameModel } from "@cartridge/arcade";
import type { EnrichedTokenContract } from "@/effect/atoms/tokens";
import { SearchResultItemComponent } from "@/features/search/SearchResultItem";
import type {
  GroupedSearchResults,
  SearchResultItem,
} from "@/features/search/types";
import {
  mapTableToEntityType,
  buildLink,
  buildTitle,
  buildSubtitle,
  buildImage,
  buildGameSearchItem,
} from "@/features/search/utils";
import { SearchInput } from "@/components/ui/modules/search-input";
import { Button } from "@cartridge/ui";

const MIN_QUERY_LENGTH = 2;
const TYPE_ORDER = { game: 0, collection: 1, player: 2 } as const;

const DEBOUNCE_MS = 300;

export function SearchResultsPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const routeSearch = useRouteSearch({ strict: false }) as { q?: string };
  const initialQuery = routeSearch?.q ?? "";

  const [localQuery, setLocalQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (localQuery !== initialQuery) {
        navigate({
          to: "/search",
          search: { q: localQuery },
          replace: true,
        });
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery, initialQuery, navigate]);

  const { data, isLoading } = useSearch({ query: initialQuery, limit: 50 });

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

  const gameResults = useMemo<SearchResultItem[]>(() => {
    if (!initialQuery || initialQuery.length < MIN_QUERY_LENGTH) return [];
    const query = initialQuery.toLowerCase();
    return games
      .filter((game) => game.name?.toLowerCase().includes(query))
      .map((game) => buildGameSearchItem(game, initialQuery))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [games, initialQuery]);

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

  const sortedItems = useMemo(() => {
    return [...results.games, ...results.collections, ...results.players].sort(
      (a, b) => {
        const typeDiff = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
        if (typeDiff !== 0) return typeDiff;
        return (b.score ?? 0) - (a.score ?? 0);
      },
    );
  }, [results]);

  const handleCancel = () => {
    router.history.back();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-spacer-100">
        <div className="flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SearchInput
            value={localQuery}
            onChange={setLocalQuery}
            placeholder="Search tokens, games, players..."
            autoFocus
          />
        </div>
        <Button variant="secondary" size="default" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <div className="p-4 text-foreground-400">Searching...</div>
        ) : sortedItems.length === 0 ? (
          <div className="p-4 text-foreground-400">
            {initialQuery.length > 0
              ? "No results found"
              : "Start typing to search"}
          </div>
        ) : (
          <div>
            {sortedItems.map((item) => (
              <SearchResultItemComponent
                key={`${item.type}-${item.id}`}
                item={item}
                query={initialQuery}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
