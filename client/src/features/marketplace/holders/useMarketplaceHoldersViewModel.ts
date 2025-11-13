import { useMemo } from "react";
import { useMarketOwnersFetcher } from "@/hooks/marketplace-owners-fetcher";
import { useMarketplaceTokensStore } from "@/store";
import { DEFAULT_PROJECT } from "@/constants";
import { useMetadataFilters } from "@/hooks/use-metadata-filters";

export interface MarketplaceHolder {
  address: string;
  username?: string;
  balance: number;
  ratio: number;
  token_ids: string[];
}

interface UseMarketplaceHoldersViewModelArgs {
  collectionAddress: string;
}

export interface MarketplaceHoldersViewModel {
  owners: MarketplaceHolder[];
  displayedOwners: MarketplaceHolder[];
  hasActiveFilters: boolean;
  totalOwners: number;
  filteredOwnersCount: number;
  isInitialLoading: boolean;
  isEmpty: boolean;
  isFilteredResultEmpty: boolean;
  isLoadingMore: boolean;
  status: ReturnType<typeof useMarketOwnersFetcher>["status"];
  editionError: ReturnType<typeof useMarketOwnersFetcher>["editionError"];
  loadingProgress: ReturnType<typeof useMarketOwnersFetcher>["loadingProgress"];
  clearAllFilters: ReturnType<typeof useMetadataFilters>["clearAllFilters"];
}

export function useMarketplaceHoldersViewModel({
  collectionAddress,
}: UseMarketplaceHoldersViewModelArgs): MarketplaceHoldersViewModel {
  const { owners, status, editionError, loadingProgress } =
    useMarketOwnersFetcher({
      project: [DEFAULT_PROJECT],
      address: collectionAddress,
    });

  const getTokens = useMarketplaceTokensStore((state) => state.getTokens);
  const tokens = getTokens(DEFAULT_PROJECT, collectionAddress ?? "");

  const { filteredTokens, activeFilters, clearAllFilters } = useMetadataFilters(
    {
      tokens: tokens || [],
      collectionAddress: collectionAddress ?? "",
      enabled: !!collectionAddress && !!tokens,
    },
  );

  const ownersArray = owners ?? [];
  const hasActiveFilters = useMemo(
    () => Object.keys(activeFilters).length > 0,
    [activeFilters],
  );

  const filteredOwners = useMemo(() => {
    if (!hasActiveFilters) return ownersArray;
    if (!ownersArray.length) return [];

    const filteredTokenIds = new Set(
      filteredTokens
        .map((token) => token.token_id?.toString())
        .filter((tokenId): tokenId is string => Boolean(tokenId)),
    );

    if (filteredTokenIds.size === 0) {
      return [];
    }

    const matchedOwners = ownersArray
      .map((owner) => {
        const ownedFilteredTokenIds = owner.token_ids.filter((tokenId) =>
          filteredTokenIds.has(tokenId),
        );

        if (ownedFilteredTokenIds.length === 0) return null;

        return {
          ...owner,
          balance: ownedFilteredTokenIds.length,
          token_ids: ownedFilteredTokenIds,
        };
      })
      .filter(Boolean) as MarketplaceHolder[];

    const totalFilteredBalance = matchedOwners.reduce(
      (sum, owner) => sum + owner.balance,
      0,
    );

    return matchedOwners
      .map((owner) => ({
        ...owner,
        ratio:
          totalFilteredBalance > 0
            ? Math.round((owner.balance / totalFilteredBalance) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [hasActiveFilters, ownersArray, filteredTokens]);

  const displayedOwners = hasActiveFilters ? filteredOwners : ownersArray;
  const totalOwners = ownersArray.length;
  const filteredOwnersCount = displayedOwners.length;

  const isInitialLoading =
    status === "idle" || (status === "loading" && ownersArray.length === 0);

  const isEmpty =
    !isInitialLoading && editionError.length === 0 && totalOwners === 0;

  const isFilteredResultEmpty = hasActiveFilters && filteredOwnersCount === 0;

  const isLoadingMore = status === "loading" && ownersArray.length > 0;

  return {
    owners: ownersArray,
    displayedOwners,
    hasActiveFilters,
    totalOwners,
    filteredOwnersCount,
    isInitialLoading,
    isEmpty,
    isFilteredResultEmpty,
    isLoadingMore,
    status,
    editionError,
    loadingProgress,
    clearAllFilters,
  };
}
