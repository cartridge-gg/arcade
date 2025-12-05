import { useMemo } from "react";
import { useHolders, type MarketplaceHolder } from "@/effect";
import { useMarketplaceTokensStore } from "@/store";
import { DEFAULT_PROJECT } from "@/constants";
import { useMetadataFilters } from "@/hooks/use-metadata-filters";

export type { MarketplaceHolder };

interface UseMarketplaceHoldersViewModelArgs {
  collectionAddress: string;
}

export interface MarketplaceHoldersViewModel {
  holders: MarketplaceHolder[];
  displayedHolders: MarketplaceHolder[];
  hasActiveFilters: boolean;
  totalHolders: number;
  filteredHoldersCount: number;
  isInitialLoading: boolean;
  isEmpty: boolean;
  isFilteredResultEmpty: boolean;
  isLoadingMore: boolean;
  status: ReturnType<typeof useHolders>["status"];
  editionError: ReturnType<typeof useHolders>["editionError"];
  clearAllFilters: ReturnType<typeof useMetadataFilters>["clearAllFilters"];
}

export function useMarketplaceHoldersViewModel({
  collectionAddress,
}: UseMarketplaceHoldersViewModelArgs): MarketplaceHoldersViewModel {
  const {
    holders,
    status,
    isLoading,
    isLoadingMore: isLoadingMoreFromHook,
    editionError,
  } = useHolders(DEFAULT_PROJECT, collectionAddress);

  const getTokens = useMarketplaceTokensStore((state) => state.getTokens);
  const tokens = getTokens(DEFAULT_PROJECT, collectionAddress ?? "");

  const { filteredTokens, activeFilters, clearAllFilters } = useMetadataFilters(
    {
      tokens: tokens || [],
      collectionAddress: collectionAddress ?? "",
      enabled: !!collectionAddress && !!tokens,
    },
  );

  const holdersArray = holders ?? [];
  const hasActiveFilters = useMemo(
    () => Object.keys(activeFilters).length > 0,
    [activeFilters],
  );

  const filteredHolders = useMemo(() => {
    if (!hasActiveFilters) return holdersArray;
    if (!holdersArray.length) return [];

    const filteredTokenIds = new Set(
      filteredTokens
        .map((token) => token.token_id?.toString())
        .filter((tokenId): tokenId is string => Boolean(tokenId)),
    );

    if (filteredTokenIds.size === 0) {
      return [];
    }

    const matchedHolders = holdersArray
      .map((holder) => {
        const ownedFilteredTokenIds = holder.token_ids.filter((tokenId) =>
          filteredTokenIds.has(tokenId),
        );

        if (ownedFilteredTokenIds.length === 0) return null;

        return {
          ...holder,
          balance: ownedFilteredTokenIds.length,
          token_ids: ownedFilteredTokenIds,
        };
      })
      .filter(Boolean) as MarketplaceHolder[];

    const totalFilteredBalance = matchedHolders.reduce(
      (sum, holder) => sum + holder.balance,
      0,
    );

    return matchedHolders
      .map((holder) => ({
        ...holder,
        ratio:
          totalFilteredBalance > 0
            ? Math.round((holder.balance / totalFilteredBalance) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [hasActiveFilters, holdersArray, filteredTokens]);

  const displayedHolders = hasActiveFilters ? filteredHolders : holdersArray;
  const totalHolders = holdersArray.length;
  const filteredHoldersCount = displayedHolders.length;

  const isInitialLoading = isLoading;

  const isEmpty =
    !isInitialLoading && editionError.length === 0 && totalHolders === 0;

  const isFilteredResultEmpty = hasActiveFilters && filteredHoldersCount === 0;

  const isLoadingMore = isLoadingMoreFromHook;

  return {
    holders: holdersArray,
    displayedHolders,
    hasActiveFilters,
    totalHolders,
    filteredHoldersCount,
    isInitialLoading,
    isEmpty,
    isFilteredResultEmpty,
    isLoadingMore,
    status,
    editionError,
    clearAllFilters,
  };
}
