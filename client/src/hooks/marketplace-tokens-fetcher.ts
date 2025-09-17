import { fetchToriisStream } from "@cartridge/arcade";
import { Token, Tokens } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getChecksumAddress } from "starknet";
import { useMarketplaceTokensStore } from "@/store";
import { useMarketCollectionFetcher } from "./marketplace-fetcher";
import {
  useFetcherState,
  fetchTokenImage,
  parseJsonSafe,
  withRetry,
  useAbortController,
  sleep,
} from "./fetcher-utils";

type MarketTokensFetcherInput = {
  project: string[],
  address: string,
}

const LIMIT = 100;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 1000;

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

  const { collections } = useMarketCollectionFetcher({ projects: project });
  const collection = useMemo(() => collections.find(c => c.contract_address === address), [collections]);

  const addTokens = useMarketplaceTokensStore(s => s.addTokens);
  const getTokens = useMarketplaceTokensStore(s => s.getTokens);



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

    return processed;
  }, [address, project]);


  const fetchTokensImpl = useCallback(async (attemptNumber: number = 0) => {
    if (attemptNumber === 0) {
      startLoading();
    }

    createController();

    const stream = fetchToriisStream(project, {
      client: async function* ({ client }) {
        let cursor = undefined;
        let totalFetched = 0;

        while (true) {
          if (!isMounted()) break;

          const response: Tokens = await client.getTokens({
            contract_addresses: [address],
            token_ids: [],
            pagination: {
              limit: LIMIT,
              cursor: cursor,
              direction: 'Forward',
              order_by: [],
            }
          });

          totalFetched += response.items.length;

          if (isMounted()) {
            setLoadingProgress({
              completed: totalFetched,
              total: totalFetched
            });
          }

          yield response;

          cursor = response.next_cursor;
          if (!cursor) break;
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
    }
  }, [project, address, addTokens, batchProcessTokens, startLoading, setSuccess, setLoadingProgress, createController, isMounted]);

  const fetchTokens = useCallback(async () => {
    try {
      await withRetry(
        async (attemptNumber) => {
          if (attemptNumber > 0) {
            setRetryCount(attemptNumber);
            setErrorMessage(`Request failed. Retrying... (${attemptNumber}/${MAX_RETRY_ATTEMPTS})`);
            await sleep(RETRY_BASE_DELAY * Math.pow(2, attemptNumber - 1));
          }
          await fetchTokensImpl(attemptNumber);
        },
        { maxAttempts: MAX_RETRY_ATTEMPTS, baseDelay: RETRY_BASE_DELAY }
      );
    } catch (error) {
      if (isMounted()) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch tokens after multiple attempts"
        );
      }
    }
  }, [fetchTokensImpl, setRetryCount, setErrorMessage, setError, isMounted]);

  const refetch = useCallback(async () => {
    setHasFetch(false);
    setRetryCount(0);
    await fetchTokens();
    setHasFetch(true);
  }, [fetchTokens]);

  useEffect(() => {
    if (!hasFetch && project.length > 0) {
      fetchTokens();
      setHasFetch(true);
    }
  }, [hasFetch, project, fetchTokens]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    collection: collection ?? null,
    tokens: getTokens(project[0], address),
    filteredTokens: getTokens(project[0], address),
    status,
    isLoading,
    isError,
    errorMessage,
    loadingProgress,
    retryCount,
    refetch,
  };
}
