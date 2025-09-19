import { fetchToriisStream } from "@cartridge/arcade";
import { Token, Tokens } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getChecksumAddress } from "starknet";
import { useMarketplaceTokensStore } from "@/store";
import { useMarketCollectionFetcher } from "./marketplace-fetcher";
import { useEditionsMap } from "@/collections";
import {
  useFetcherState,
  fetchTokenImage,
  parseJsonSafe,
  withRetry,
  useAbortController,
  sleep,
} from "./fetcher-utils";
import { useMetadataFilterStore } from "@/store/metadata-filters";
import { buildMetadataIndex, updateMetadataIndex } from "@/utils/metadata-indexer";

type MarketTokensFetcherInput = {
  project: string[],
  address: string,
}

const LIMIT = 100;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 1000;
const POLL_INTERVAL = 30000; // 30 seconds

enum FetchStrategy {
  INITIAL = 'initial',
  INCREMENTAL = 'incremental',
  CHECK_NEW = 'check_new',
}

export function useMarketTokensFetcher({ project, address }: MarketTokensFetcherInput) {
  const {
    status,
    isLoading,
    isError,
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
  const { createController, cleanup, isMounted } = useAbortController();
  const editions = useEditionsMap();

  const { collections } = useMarketCollectionFetcher({ projects: project });
  const collection = useMemo(() => collections.find(c => c.contract_address === address), [collections]);

  const addTokens = useMarketplaceTokensStore(s => s.addTokens);
  const getTokens = useMarketplaceTokensStore(s => s.getTokens);
  const updateLoadingState = useMarketplaceTokensStore(s => s.updateLoadingState);
  const getLoadingState = useMarketplaceTokensStore(s => s.getLoadingState);
  const clearTokens = useMarketplaceTokensStore(s => s.clearTokens);
  const getOwners = useMarketplaceTokensStore(s => s.getOwners);

  // Metadata filter store
  const { setMetadataIndex, getCollectionState } = useMetadataFilterStore();

  const batchProcessTokens = useCallback(async (data: Token[]) => {
    const processed: { [address: string]: Token[] } = { [address]: [] };
    for (const t of data) {
      const metadata = parseJsonSafe(t.metadata, t.metadata);

      const item = {
        ...t,
        contract_address: getChecksumAddress(t.contract_address),
        metadata: metadata,
        image: await fetchTokenImage(t, project[0], true),
      }

      processed[address].push(item as Token)
    }

    // Build/update metadata index for filtering
    const collectionState = getCollectionState(address);
    const existingIndex = collectionState?.metadataIndex;

    if (existingIndex && Object.keys(existingIndex).length > 0) {
      // Update existing index with new tokens
      const updatedIndex = updateMetadataIndex(existingIndex, processed[address]);
      setMetadataIndex(address, updatedIndex);
    } else {
      // Build new index from scratch
      const allTokens = getTokens(project[0], address);
      const combinedTokens = [...allTokens, ...processed[address]];
      const newIndex = buildMetadataIndex(combinedTokens);
      setMetadataIndex(address, newIndex);
    }

    return processed;
  }, [address, project, getCollectionState, setMetadataIndex, getTokens]);


  const fetchTokensImpl = useCallback(async (strategy: FetchStrategy = FetchStrategy.INITIAL, attemptNumber: number = 0) => {
    const loadingState = getLoadingState(project[0], address);

    if (attemptNumber === 0) {
      startLoading();
      updateLoadingState(project[0], address, { isLoading: true });
    }

    createController();

    const stream = fetchToriisStream(project, {
      client: async function* ({ client }) {
        let cursor = strategy === FetchStrategy.INCREMENTAL && loadingState?.lastCursor
          ? loadingState.lastCursor
          : undefined;
        let totalFetched = strategy === FetchStrategy.INCREMENTAL && loadingState?.totalCount
          ? loadingState.totalCount
          : 0;
        let latestCursor = cursor;

        while (true) {
          if (!isMounted()) break;

          const response: Tokens = await client.getTokens({
            contract_addresses: [address],
            token_ids: [],
            pagination: {
              limit: strategy === FetchStrategy.CHECK_NEW ? 10 : LIMIT,
              cursor: cursor,
              direction: 'Forward',
              order_by: [],
            }
          });

          totalFetched += response.items.length;
          latestCursor = response.next_cursor || latestCursor;

          if (isMounted()) {
            setLoadingProgress({
              completed: totalFetched,
              total: totalFetched
            });
          }

          yield response;

          // For CHECK_NEW strategy, only fetch one batch
          if (strategy === FetchStrategy.CHECK_NEW && response.items.length > 0) {
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
          } else {
            // Update cursor for incremental fetching
            updateLoadingState(project[0], address, {
              lastCursor: cursor,
              totalCount: totalFetched,
            });
          }
        }
      }
    });

    for await (const result of stream) {
      if (!isMounted()) break;

      const tokens = await batchProcessTokens(result.data.items);
      addTokens(result.endpoint, tokens);
    }

    if (isMounted()) {
      setSuccess();
      updateLoadingState(project[0], address, {
        isLoading: false,
        lastFetchTime: Date.now()
      });
    }
  }, [project, address, addTokens, batchProcessTokens, startLoading, setSuccess, setLoadingProgress, createController, isMounted, getLoadingState, updateLoadingState]);

  const fetchTokens = useCallback(async (strategy: FetchStrategy = FetchStrategy.INITIAL) => {
    try {
      await withRetry(
        async (attemptNumber) => {
          if (attemptNumber > 0) {
            setRetryCount(attemptNumber);
            setErrorMessage(`Request failed. Retrying... (${attemptNumber}/${MAX_RETRY_ATTEMPTS})`);
            await sleep(RETRY_BASE_DELAY * Math.pow(2, attemptNumber - 1));
          }
          await fetchTokensImpl(strategy, attemptNumber);
        },
        { maxAttempts: MAX_RETRY_ATTEMPTS, baseDelay: RETRY_BASE_DELAY }
      );
    } catch (error) {
      if (isMounted()) {
        const e = editions.get(project[0]);
        if (e) {
          setError(
            e,
            error instanceof Error
              ? error.message
              : "Failed to fetch tokens after multiple attempts"
          );
        }
        updateLoadingState(project[0], address, { isLoading: false });
      }
    }
  }, [fetchTokensImpl, setRetryCount, setErrorMessage, setError, isMounted, updateLoadingState, project, address, editions]);

  const refetch = useCallback(async (force: boolean = false) => {
    if (force) {
      // Force full refetch by clearing tokens and state
      clearTokens(project[0], address);
      await fetchTokens(FetchStrategy.INITIAL);
    } else {
      // Incremental fetch from last cursor
      const loadingState = getLoadingState(project[0], address);
      if (loadingState?.isComplete) {
        await fetchTokens(FetchStrategy.CHECK_NEW);
      } else {
        await fetchTokens(FetchStrategy.INCREMENTAL);
      }
    }
  }, [fetchTokens, clearTokens, getLoadingState, project, address]);

  useEffect(() => {
    if (!hasFetch && project.length > 0) {
      fetchTokens(FetchStrategy.INITIAL);
      setHasFetch(true);
    }
  }, [hasFetch, project]); // Remove fetchTokens from deps to avoid re-runs

  // Periodic polling for new items
  useEffect(() => {
    if (!project.length || !hasFetch) return;

    const interval = setInterval(() => {
      const loadingState = getLoadingState(project[0], address);
      if (loadingState?.isComplete && !loadingState.isLoading) {
        // Check for new items
        fetchTokens(FetchStrategy.CHECK_NEW);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [project, address, hasFetch, getLoadingState]); // Remove fetchTokens from deps

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    collection: collection ?? null,
    tokens: getTokens(project[0], address),
    filteredTokens: getTokens(project[0], address),
    owners: getOwners(project[0], address),
    status,
    isLoading,
    isError,
    errorMessage,
    loadingProgress,
    retryCount,
    refetch,
  };
}
