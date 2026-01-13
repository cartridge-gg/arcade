import { useTokenContract } from "@/effect";
import { DEFAULT_PROJECT } from "@/constants";
import { useMarketplaceTokensStore } from "@/store";
import type {
  FetchTokenBalancesResult,
  UseMarketplaceQueryResult,
} from "@cartridge/arcade/marketplace";
import { useMarketplaceTokenBalances } from "@cartridge/arcade/marketplace/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding, getChecksumAddress } from "starknet";

type MarketBalancesFetcherInput = {
  project: string[];
  address: string;
  autoFetch?: boolean;
  tokenId?: string;
};

const LIMIT = 100;

type TokenBalancesQuery = UseMarketplaceQueryResult<FetchTokenBalancesResult>;

export function useMarketBalancesFetcher({
  project,
  address,
  autoFetch = true,
  tokenId,
}: MarketBalancesFetcherInput) {
  const addBalances = useMarketplaceTokensStore((state) => state.addBalances);
  const clearBalances = useMarketplaceTokensStore(
    (state) => state.clearBalances,
  );

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const prevAddressRef = useRef<string | null>(null);
  const prevTokenIdRef = useRef<string | null>(null);

  const projectId = project[0] ?? DEFAULT_PROJECT;

  const normalizedAddress = useMemo(() => {
    if (!address) return "";
    try {
      return addAddressPadding(address);
    } catch (error) {
      console.warn(
        "Invalid contract address provided to useMarketBalancesFetcher",
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
      project: projectId,
      contractAddresses: normalizedAddress ? [normalizedAddress] : [],
      tokenIds: tokenId ? [tokenId] : [],
      cursor,
      limit: LIMIT,
    };
  }, [projectId, normalizedAddress, tokenId, cursor]);

  const enabled =
    autoFetch &&
    Boolean(projectId) &&
    normalizedAddress.length > 0 &&
    collection !== null &&
    collection !== undefined;

  const { data, status, error, isFetching }: TokenBalancesQuery =
    useMarketplaceTokenBalances(queryOptions, enabled);

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

    if (!page.balances.length) return;

    addBalances(projectId, {
      [address]: page.balances,
    });
  }, [data, projectError, projectId, address, addBalances]);

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
    clearBalances(projectId, address);
    setCursor(undefined);
    setNextCursor(null);
    setIsFetchingNextPage(false);
  }, [address, normalizedAddress, projectId, clearBalances]);

  useEffect(() => {
    if (!address) return;

    const tokenIdKey = tokenId || null;

    if (prevTokenIdRef.current === tokenIdKey) return;

    if (prevTokenIdRef.current !== null) {
      clearBalances(projectId, address);
      setCursor(undefined);
      setNextCursor(null);
      setIsFetchingNextPage(false);
    }

    prevTokenIdRef.current = tokenIdKey;
  }, [tokenId, address, projectId, clearBalances]);

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

  const balances = useMarketplaceTokensStore(
    (state) => state.balances[projectId]?.[address],
  );

  const filteredBalances = useMemo(() => {
    if (!balances) return [];
    if (!tokenId) return balances;
    return balances
      .filter(
        (b) =>
          BigInt(b.token_id ?? "0x0") ===
          BigInt(tokenId.startsWith("0x") ? tokenId : `0x${tokenId}`),
      )
      .filter((b) => BigInt(b.balance ?? "0x0") !== 0n);
  }, [balances, tokenId]);

  const effectiveStatus = projectError ? "error" : status;
  const effectiveError = projectError?.error ?? error ?? null;

  return {
    collection,
    balances: filteredBalances,
    status: effectiveStatus,
    isLoading: effectiveStatus === "loading" && !isFetchingNextPage,
    isError: effectiveStatus === "error",
    errorMessage: effectiveError ? effectiveError.message : null,
    hasMore: Boolean(nextCursor),
    isFetchingNextPage: isFetchingNextPage || (isFetching && Boolean(cursor)),
    fetchNextPage,
  };
}
