import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Token } from "@/types/torii";
import { addAddressPadding, getChecksumAddress } from "starknet";
import {
  useMarketplaceCollectionTokens,
  type UseMarketplaceQueryResult,
} from "@cartridge/arcade/marketplace/react";
import type { FetchCollectionTokensResult } from "@cartridge/arcade/marketplace";
import { DEFAULT_PROJECT } from "@/constants";
import { useMarketplaceTokensStore } from "@/store";
import { useTokenContract } from "@/effect";
import { fetchTokenImage } from "./fetcher-utils";

type MarketTokensFetcherInput = {
  project: string[];
  address: string;
  autoFetch?: boolean;
  attributeFilters?: { [name: string]: Set<string> };
  tokenIds?: string[];
};

const LIMIT = 100;

type CollectionTokensQuery =
  UseMarketplaceQueryResult<FetchCollectionTokensResult>;

export function useMarketTokensFetcher({
  project,
  address,
  autoFetch = true,
  attributeFilters,
  tokenIds,
}: MarketTokensFetcherInput) {
  const addTokens = useMarketplaceTokensStore((state) => state.addTokens);
  const clearTokens = useMarketplaceTokensStore((state) => state.clearTokens);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const prevAddressRef = useRef<string | null>(null);
  const prevFiltersRef = useRef<string | null>(null);

  const projectId = project[0] ?? DEFAULT_PROJECT;

  const normalizedAddress = useMemo(() => {
    if (!address) return "";
    try {
      return addAddressPadding(address);
    } catch (error) {
      console.warn(
        "Invalid contract address provided to useMarketTokensFetcher",
        {
          address,
          error,
        },
      );
      return "";
    }
  }, [address]);

  const collection = useTokenContract(getChecksumAddress(address));

  const queryOptions = useMemo(() => {
    return {
      address: normalizedAddress,
      cursor,
      attributeFilters,
      tokenIds,
      limit: LIMIT,
    };
  }, [normalizedAddress, cursor, attributeFilters, tokenIds]);

  const enabled =
    autoFetch &&
    Boolean(projectId) &&
    normalizedAddress.length > 0 &&
    collection !== null &&
    collection !== undefined;

  const { data, status, error, isFetching }: CollectionTokensQuery =
    useMarketplaceCollectionTokens(queryOptions, enabled);

  const projectError = useMemo(() => {
    if (!data) return null;
    return data.error;
  }, [data]);

  useEffect(() => {
    if (!data || projectError) {
      if (projectError) {
        setIsFetchingNextPage(false);
      }
      return;
    }

    const page = data.page;
    if (!page) {
      setNextCursor(null);
      return;
    }

    setNextCursor(page.nextCursor);
    setIsFetchingNextPage(false);

    if (!page.tokens.length) return;

    (async () => {
      const enriched = await Promise.all(
        page.tokens.map(async (token) => {
          const image = await fetchTokenImage(token as Token, projectId, true);
          return { ...token, image };
        }),
      );

      addTokens(projectId, {
        [address]: enriched as Token[],
      });
    })().catch((err) => {
      console.error("Failed to enrich marketplace tokens", err);
    });
  }, [data, projectError, projectId, address, addTokens]);

  useEffect(() => {
    if (!enabled) {
      setCursor(undefined);
      setNextCursor(null);
      setIsFetchingNextPage(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!normalizedAddress) return;
    if (!address) return;
    const checksumAddress = normalizedAddress;
    if (prevAddressRef.current === checksumAddress) return;

    prevAddressRef.current = checksumAddress;
    clearTokens(projectId, address);
    setCursor(undefined);
    setNextCursor(null);
    setIsFetchingNextPage(false);
  }, [address, normalizedAddress, projectId, clearTokens]);

  useEffect(() => {
    if (!address) return;

    const filtersKey = JSON.stringify([
      attributeFilters
        ? Object.entries(attributeFilters).map(([key, values]) => [
            key,
            Array.from(values).sort(),
          ])
        : null,
      tokenIds?.sort() ?? null,
    ]);

    if (prevFiltersRef.current === filtersKey) return;

    if (prevFiltersRef.current !== null) {
      clearTokens(projectId, address);
      setCursor(undefined);
      setNextCursor(null);
      setIsFetchingNextPage(false);
    }

    prevFiltersRef.current = filtersKey;
  }, [attributeFilters, tokenIds, address, projectId, clearTokens]);

  useEffect(() => {
    if (projectError || status === "error") {
      setIsFetchingNextPage(false);
    }
  }, [status, projectError]);

  const fetchNextPage = useCallback(() => {
    if (!nextCursor) return;
    setIsFetchingNextPage(true);
    setCursor(nextCursor);
  }, [nextCursor]);

  const tokens = useMarketplaceTokensStore(
    (state) => state.tokens[projectId]?.[address],
  );

  const effectiveStatus = projectError ? "error" : status;
  const effectiveError = projectError?.error ?? error ?? null;

  return {
    collection,
    tokens,
    owners: [],
    status: effectiveStatus,
    isLoading: effectiveStatus === "loading" && !isFetchingNextPage,
    isError: effectiveStatus === "error",
    errorMessage: effectiveError ? effectiveError.message : null,
    loadingProgress: undefined,
    retryCount: 0,
    hasMore: Boolean(nextCursor),
    isFetchingNextPage: isFetchingNextPage || (isFetching && Boolean(cursor)),
    fetchNextPage,
  };
}
