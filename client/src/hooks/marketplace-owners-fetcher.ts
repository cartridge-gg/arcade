import { useEditionsMap, useAccounts } from "@/collections";
import { DEFAULT_PROJECT } from "@/constants";
import { useMarketplaceTokensStore } from "@/store";
import type {
  FetchTokenBalancesResult,
  UseMarketplaceQueryResult,
} from "@cartridge/arcade/marketplace";
import { useMarketplaceTokenBalances } from "@cartridge/arcade/marketplace/react";
import type { TokenBalance } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { useMarketCollectionFetcher } from "./marketplace-fetcher";

type MarketOwnersFetcherInput = {
  project: string[];
  address: string;
  autoFetch?: boolean;
};

const LIMIT = 1000;

type TokenBalancesQuery = UseMarketplaceQueryResult<FetchTokenBalancesResult>;

export function useMarketOwnersFetcher({
  project,
  address,
  autoFetch = true,
}: MarketOwnersFetcherInput) {
  const { data: usernamesMap } = useAccounts();
  const editions = useEditionsMap();
  const addOwners = useMarketplaceTokensStore((state) => state.addOwners);
  const clearOwners = useMarketplaceTokensStore((state) => state.clearOwners);
  const getOwners = useMarketplaceTokensStore((state) => state.getOwners);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const prevAddressRef = useRef<string | null>(null);
  const prevProjectRef = useRef<string | null>(null);

  const projectId = project[0] ?? DEFAULT_PROJECT;

  const { collections } = useMarketCollectionFetcher({ projects: project });
  const collection = useMemo(
    () => collections.find((c) => c.contract_address === address),
    [collections, address],
  );

  const normalizedAddress = useMemo(() => {
    if (!address) return "";
    try {
      return addAddressPadding(address);
    } catch (error) {
      console.warn(
        "Invalid contract address provided to useMarketOwnersFetcher",
        {
          address,
          error,
        },
      );
      return "";
    }
  }, [address]);

  const queryOptions = useMemo(() => {
    return {
      project: projectId,
      contractAddresses: normalizedAddress ? [normalizedAddress] : [],
      accountAddresses: [],
      tokenIds: [],
      cursor,
      limit: LIMIT,
    };
  }, [projectId, normalizedAddress, cursor]);

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

  const batchProcessOwners = useCallback(
    async (balances: TokenBalance[]) => {
      const processed: {
        [address: string]: {
          [ownerAddress: string]: {
            balance: number;
            token_ids: string[];
            username?: string;
          };
        };
      } = { [address]: {} };

      const balanceMap: { [ownerAddress: string]: bigint } = {};
      const tokenIdsMap: { [ownerAddress: string]: string[] } = {};

      for (const balance of balances) {
        const balanceValue = BigInt(balance.balance);
        if (balanceValue === 0n) continue;

        const ownerAddress = getChecksumAddress(balance.account_address);
        if (BigInt(ownerAddress) === 0n) continue;

        if (!balanceMap[ownerAddress]) {
          balanceMap[ownerAddress] = balanceValue;
          tokenIdsMap[ownerAddress] = [];
        } else {
          balanceMap[ownerAddress] += balanceValue;
        }

        if (balance.token_id) {
          tokenIdsMap[ownerAddress].push(balance.token_id);
        }
      }

      for (const [ownerAddress, balance] of Object.entries(balanceMap)) {
        const balanceNumber = Number(balance);

        processed[address][ownerAddress] = {
          balance: balanceNumber,
          token_ids: tokenIdsMap[ownerAddress] || [],
          username: usernamesMap?.get(ownerAddress),
        };
      }

      return processed;
    },
    [address, usernamesMap],
  );

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

    void batchProcessOwners(page.balances).then((owners) => {
      addOwners(projectId, owners);
    });
  }, [data, projectError, projectId, address, addOwners, batchProcessOwners]);

  useEffect(() => {
    if (!enabled) {
      setCursor(undefined);
      setNextCursor(null);
      setIsFetchingNextPage(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!usernamesMap || usernamesMap.size === 0) return;

    const currentOwners = getOwners(projectId, address);
    if (currentOwners.length === 0) return;

    const needsUpdate = currentOwners.some(
      (o) => !o.username && usernamesMap.has(o.address),
    );

    if (needsUpdate) {
      const updated: {
        [ownerAddress: string]: {
          balance: number;
          token_ids: string[];
          username?: string;
        };
      } = {};

      for (const owner of currentOwners) {
        updated[owner.address] = {
          balance: owner.balance,
          token_ids: owner.token_ids,
          username: usernamesMap.get(owner.address) || owner.username,
        };
      }

      addOwners(projectId, { [address]: updated });
    }
  }, [usernamesMap, projectId, address, getOwners, addOwners]);

  useEffect(() => {
    if (!normalizedAddress) return;
    if (!address) return;
    const checksumAddress = normalizedAddress;
    if (
      prevAddressRef.current === checksumAddress &&
      prevProjectRef.current === projectId
    ) {
      return;
    }

    prevAddressRef.current = checksumAddress;
    prevProjectRef.current = projectId;
    clearOwners(projectId, address);
    setCursor(undefined);
    setNextCursor(null);
    setIsFetchingNextPage(false);
    setInitialLoadComplete(false);
    setIsAutoFetching(false);
  }, [address, normalizedAddress, projectId, clearOwners]);

  useEffect(() => {
    if (projectError || status === "error") {
      setIsFetchingNextPage(false);
    }
  }, [status, projectError]);

  useEffect(() => {
    if (!autoFetch || !enabled) return;
    if (initialLoadComplete) return;
    if (isFetching || isFetchingNextPage) return;
    if (!nextCursor) {
      if (isAutoFetching) {
        setIsAutoFetching(false);
        setInitialLoadComplete(true);
      }
      return;
    }

    setIsAutoFetching(true);
    setIsFetchingNextPage(true);
    setCursor(nextCursor);
  }, [
    nextCursor,
    isFetching,
    isFetchingNextPage,
    autoFetch,
    enabled,
    initialLoadComplete,
    isAutoFetching,
  ]);

  const fetchNextPage = useCallback(() => {
    if (!nextCursor) return;
    setIsFetchingNextPage(true);
    setCursor(nextCursor);
  }, [nextCursor]);

  const refetch = useCallback(() => {
    clearOwners(projectId, address);
    setCursor(undefined);
    setNextCursor(null);
    setIsFetchingNextPage(false);
    setInitialLoadComplete(false);
    setIsAutoFetching(false);
  }, [clearOwners, projectId, address]);

  const owners = getOwners(projectId, address);

  const effectiveStatus = projectError ? "error" : status;
  const effectiveError = projectError?.error ?? error ?? null;
  const edition = effectiveError ? editions.get(projectId) : null;
  const editionError = edition ? [edition] : [];

  return {
    collection: collection ?? null,
    owners,
    status: effectiveStatus,
    isLoading: effectiveStatus === "loading" && !isFetchingNextPage,
    isError: effectiveStatus === "error",
    editionError,
    errorMessage: effectiveError ? effectiveError.message : null,
    loadingProgress: undefined,
    retryCount: 0,
    hasMore: Boolean(nextCursor),
    isFetchingNextPage: isFetchingNextPage || (isFetching && Boolean(cursor)),
    isAutoFetching,
    initialLoadComplete,
    fetchNextPage,
    refetch,
  };
}
