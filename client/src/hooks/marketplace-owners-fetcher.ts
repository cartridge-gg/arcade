import { useEditionsMap } from "@/collections";
import {
  fetchToriisStream,
  type ClientCallbackParams,
} from "@cartridge/arcade";
import type { TokenBalance } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getChecksumAddress } from "starknet";
import { useMarketplaceTokensStore } from "@/store";
import { useMarketCollectionFetcher } from "./marketplace-fetcher";
import {
  useFetcherState,
  withRetry,
  sleep,
  useAbortController,
} from "./fetcher-utils";
import { useAccounts } from "@/collections";

type MarketOwnersFetcherInput = {
  project: string[];
  address: string;
};

const MAX_RETRY_ATTEMPTS = 3;
const LIMIT = 1000;
const RETRY_BASE_DELAY = 1000;
const POLL_INTERVAL = 30000; // 30 seconds
const CACHE_DURATION = 30000; // 30 seconds

enum FetchStrategy {
  INITIAL = "initial",
  INCREMENTAL = "incremental",
  CHECK_NEW = "check_new",
}

type OwnersLoadingState = {
  isLoading: boolean;
  isComplete: boolean;
  lastCursor: string | null;
  lastFetchTime: number;
  totalCount?: number;
};

export function useMarketOwnersFetcher({
  project,
  address,
}: MarketOwnersFetcherInput) {
  const {
    status,
    isLoading,
    isError,
    editionError,
    errorMessage,
    loadingProgress,
    retryCount,
    setRetryCount,
    startLoading,
    setSuccess,
    setError,
    setLoadingProgress,
    setErrorMessage,
  } = useFetcherState(true);

  const [hasFetch, setHasFetch] = useState(false);
  const [ownersLoadingState, setOwnersLoadingState] = useState<{
    [key: string]: OwnersLoadingState;
  }>({});
  const { createController, cleanup, isMounted } = useAbortController();

  const { data: usernamesMap } = useAccounts();
  const { collections } = useMarketCollectionFetcher({ projects: project });
  const collection = useMemo(
    () => collections.find((c) => c.contract_address === address),
    [collections, address],
  );

  const editions = useEditionsMap();
  const getOwners = useMarketplaceTokensStore((s) => s.getOwners);

  const getLoadingState = useCallback(
    (project: string, address: string) => {
      const key = `${project}_${address}_owners`;
      return ownersLoadingState[key] || null;
    },
    [ownersLoadingState],
  );

  const updateLoadingState = useCallback(
    (project: string, address: string, state: Partial<OwnersLoadingState>) => {
      setOwnersLoadingState((prev) => {
        const key = `${project}_${address}_owners`;
        const currentState = prev[key] || {
          isLoading: false,
          isComplete: false,
          lastCursor: null,
          lastFetchTime: 0,
        };

        return {
          ...prev,
          [key]: {
            ...currentState,
            ...state,
          },
        };
      });
    },
    [],
  );

  const batchProcessOwners = useCallback(
    async (data: TokenBalance[]) => {
      const processed: {
        [address: string]: {
          [ownerAddress: string]: {
            balance: number;
            token_ids: string[];
            username?: string;
          };
        };
      } = { [address]: {} };

      // Group balances and collect token IDs
      const balanceMap: { [ownerAddress: string]: bigint } = {};
      const tokenIdsMap: { [ownerAddress: string]: string[] } = {};

      for (const balance of data) {
        const ownerAddress = getChecksumAddress(balance.account_address);
        // Convert hex or decimal string to BigInt
        const balanceValue = BigInt(balance.balance);

        if (!balanceMap[ownerAddress]) {
          balanceMap[ownerAddress] = balanceValue;
          tokenIdsMap[ownerAddress] = [];
        } else {
          balanceMap[ownerAddress] += balanceValue;
        }

        // Collect token IDs if present
        if (balance.token_id) {
          tokenIdsMap[ownerAddress].push(balance.token_id);
        }
      }

      // Prepare final data
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

  const addOwners = useCallback(
    (
      project: string,
      owners: {
        [address: string]: {
          [ownerAddress: string]: {
            balance: number;
            token_ids: string[];
            username?: string;
          };
        };
      },
    ) => {
      useMarketplaceTokensStore.setState((state) => {
        const existingOwners = { ...state.owners };

        // Initialize project if it doesn't exist
        if (!existingOwners[project]) {
          existingOwners[project] = {};
        }

        // Process each collection
        for (const [collectionAddress, collectionOwners] of Object.entries(
          owners,
        )) {
          if (!existingOwners[project][collectionAddress]) {
            existingOwners[project][collectionAddress] = {};
          }

          // Merge with existing owners
          existingOwners[project][collectionAddress] = {
            ...existingOwners[project][collectionAddress],
            ...collectionOwners,
          };
        }

        return { owners: existingOwners };
      });
    },
    [],
  );

  const clearOwners = useCallback((project: string, address: string) => {
    useMarketplaceTokensStore.setState((state) => {
      const owners = { ...state.owners };

      if (owners[project]?.[address]) {
        delete owners[project][address];
      }

      return { owners };
    });

    // Clear loading state
    const key = `${project}_${address}_owners`;
    setOwnersLoadingState((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const fetchOwnersImpl = useCallback(
    async (
      strategy: FetchStrategy = FetchStrategy.INITIAL,
      attemptNumber = 0,
    ) => {
      const loadingState = getLoadingState(project[0], address);
      const now = Date.now();

      // Check if we should skip fetching
      if (strategy === FetchStrategy.INITIAL && loadingState) {
        if (
          loadingState.isComplete &&
          now - loadingState.lastFetchTime < CACHE_DURATION
        ) {
          // Collection is complete and recently fetched, skip
          setSuccess();
          return;
        }
      }

      if (attemptNumber === 0) {
        startLoading();
        updateLoadingState(project[0], address, { isLoading: true });
      }

      createController();

      const stream = fetchToriisStream(project, {
        client: async function* ({ client }: ClientCallbackParams) {
          let cursor =
            strategy === FetchStrategy.INCREMENTAL && loadingState?.lastCursor
              ? loadingState.lastCursor
              : undefined;
          let totalFetched =
            strategy === FetchStrategy.INCREMENTAL && loadingState?.totalCount
              ? loadingState.totalCount
              : 0;
          let latestCursor = cursor;

          while (true) {
            if (!isMounted()) break;

            const response = await client.getTokenBalances({
              contract_addresses: [address],
              account_addresses: [],
              token_ids: [],
              pagination: {
                limit: strategy === FetchStrategy.CHECK_NEW ? 10 : LIMIT,
                cursor: cursor,
                direction: "Forward",
                order_by: [],
              },
            });

            totalFetched += response.items.length;
            latestCursor = response.next_cursor || latestCursor;

            if (isMounted()) {
              setLoadingProgress({
                completed: totalFetched,
                total: totalFetched,
              });
            }

            yield response;

            // For CHECK_NEW strategy, only fetch one batch
            if (
              strategy === FetchStrategy.CHECK_NEW &&
              response.items.length > 0
            ) {
              break;
            }

            cursor = response.next_cursor;
            if (!cursor) {
              // Collection fully fetched
              updateLoadingState(project[0], address, {
                isComplete: true,
                lastCursor: null,
                lastFetchTime: Date.now(),
                totalCount: totalFetched,
                isLoading: false,
              });
              break;
            }
            // Update cursor for incremental fetching
            updateLoadingState(project[0], address, {
              lastCursor: cursor,
              totalCount: totalFetched,
            });
          }
        },
      });

      for await (const result of stream) {
        if (!isMounted()) break;

        const owners = await batchProcessOwners(result.data.items);
        addOwners(result.endpoint, owners);
      }

      if (isMounted()) {
        setSuccess();
        updateLoadingState(project[0], address, {
          isLoading: false,
          lastFetchTime: Date.now(),
        });
      }
    },
    [
      project,
      address,
      addOwners,
      batchProcessOwners,
      startLoading,
      setSuccess,
      setLoadingProgress,
      createController,
      isMounted,
      getLoadingState,
      updateLoadingState,
    ],
  );

  const fetchOwners = useCallback(
    async (strategy: FetchStrategy = FetchStrategy.INITIAL) => {
      try {
        await withRetry(
          async (attemptNumber) => {
            if (attemptNumber > 0) {
              setRetryCount(attemptNumber);
              setErrorMessage(
                `Request failed. Retrying... (${attemptNumber}/${MAX_RETRY_ATTEMPTS})`,
              );
              await sleep(RETRY_BASE_DELAY * 2 ** (attemptNumber - 1));
            }
            await fetchOwnersImpl(strategy, attemptNumber);
          },
          { maxAttempts: MAX_RETRY_ATTEMPTS, baseDelay: RETRY_BASE_DELAY },
        );
      } catch (error) {
        if (isMounted()) {
          const e = editions.get(project[0]);
          setError(
            e,
            error instanceof Error
              ? error.message
              : "Failed to fetch owners after multiple attempts",
          );
          updateLoadingState(project[0], address, { isLoading: false });
        }
      }
    },
    [
      fetchOwnersImpl,
      setRetryCount,
      setErrorMessage,
      setError,
      isMounted,
      updateLoadingState,
      project,
      address,
    ],
  );

  const refetch = useCallback(
    async (force = false) => {
      if (force) {
        // Force full refetch by clearing owners and state
        clearOwners(project[0], address);
        await fetchOwners(FetchStrategy.INITIAL);
      } else {
        // Incremental fetch from last cursor
        const loadingState = getLoadingState(project[0], address);
        if (loadingState?.isComplete) {
          await fetchOwners(FetchStrategy.CHECK_NEW);
        } else {
          await fetchOwners(FetchStrategy.INCREMENTAL);
        }
      }
    },
    [fetchOwners, clearOwners, getLoadingState, project, address],
  );

  useEffect(() => {
    if (!hasFetch && project.length > 0) {
      fetchOwners(FetchStrategy.INITIAL);
      setHasFetch(true);
    }
  }, [hasFetch, project]); // Remove fetchOwners from deps to avoid re-runs

  // Periodic polling for new items
  useEffect(() => {
    if (!project.length || !hasFetch) return;

    const interval = setInterval(() => {
      const loadingState = getLoadingState(project[0], address);
      if (loadingState?.isComplete && !loadingState.isLoading) {
        // Check for new items
        fetchOwners(FetchStrategy.CHECK_NEW);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [project, address, hasFetch, getLoadingState]); // Remove fetchOwners from deps

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    collection: collection ?? null,
    owners: getOwners(project[0], address),
    status,
    isLoading,
    isError,
    editionError,
    errorMessage,
    loadingProgress,
    retryCount,
    refetch,
  };
}
