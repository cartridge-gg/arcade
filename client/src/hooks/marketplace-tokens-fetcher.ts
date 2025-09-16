import { fetchToriisStream } from "@cartridge/arcade";
import { Token, Tokens } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChecksumAddress } from "starknet";
import { useMarketplaceTokensStore } from "@/store";
import { useMarketCollectionFetcher } from "./marketplace-fetcher";
import { MetadataHelper } from "@/helpers/metadata";

type MarketTokensFetcherInput = {
  project: string[],
  address: string,
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 1000;

export function useMarketTokensFetcher({ project, address }: MarketTokensFetcherInput) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    completed: number;
    total: number;
  }>({ completed: 0, total: 0 });
  const [hasFetch, setHasFetch] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const { collections } = useMarketCollectionFetcher({ projects: project });
  const collection = useMemo(() => collections.find(c => c.contract_address === address), [collections]);

  const addTokens = useMarketplaceTokensStore(s => s.addTokens);
  const getTokens = useMarketplaceTokensStore(s => s.getTokens);


  const fetchImage = async (token: Token, project: string) => {
    const toriiImage = await MetadataHelper.unsafeGetToriiImage(
      project,
      token,
    );
    if (toriiImage) {
      return toriiImage;
    }
    const metadataImage = await MetadataHelper.getMetadataImage(token);
    if (metadataImage) {
      return metadataImage;
    }
    return "";
  };

  const batchProcessTokens = useCallback(async (data: Token[]) => {
    const processed: { [address: string]: Token[] } = { [address]: [] };
    for (const t of data) {

      let metadata = t.metadata;
      try {
        metadata = JSON.parse(t.metadata);

      } catch (err) { }

      const item = {
        ...t,
        contract_address: getChecksumAddress(t.contract_address),
        metadata: metadata,
        image: await fetchImage(t, project[0]),
      }

      processed[address].push(item as Token)
    }

    return processed;
  }, [address, project]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchTokensWithRetry = useCallback(async (attemptNumber: number = 0): Promise<void> => {
    try {
      if (!isMountedRef.current) return;

      if (attemptNumber === 0) {
        setStatus("loading");
        setIsLoading(true);
        setIsError(false);
        setErrorMessage(null);
        setLoadingProgress({ completed: 0, total: 0 });
      }

      abortControllerRef.current = new AbortController();

      const stream = fetchToriisStream(project, {
        client: async function* ({ client }) {
          let cursor = undefined;
          let totalFetched = 0;

          while (true) {
            if (!isMountedRef.current) break;

            const response: Tokens = await client.getTokens({
              contract_addresses: [address],
              token_ids: [],
              pagination: {
                limit: 500,
                cursor: cursor,
                direction: 'Forward',
                order_by: [],
              }
            });

            totalFetched += response.items.length;

            if (isMountedRef.current) {
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
        if (!isMountedRef.current) break;

        const tokens = await batchProcessTokens(result.data.items);
        addTokens(result.endpoint, tokens);
      }

      if (isMountedRef.current) {
        setStatus("success");
        setIsLoading(false);
        setRetryCount(0);
      }

    } catch (error) {

      if (!isMountedRef.current) return;

      if (attemptNumber < MAX_RETRY_ATTEMPTS - 1) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attemptNumber);
        setRetryCount(attemptNumber + 1);
        setErrorMessage(`Request failed. Retrying... (${attemptNumber + 1}/${MAX_RETRY_ATTEMPTS})`);

        await sleep(delay);

        if (isMountedRef.current) {
          return fetchTokensWithRetry(attemptNumber + 1);
        }
      } else {
        if (isMountedRef.current) {
          setStatus("error");
          setIsLoading(false);
          setIsError(true);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to fetch tokens after multiple attempts"
          );
          setRetryCount(0);
        }
      }
    }
  }, [project, address, addTokens, batchProcessTokens]);

  const fetchTokens = useCallback(async () => {
    await fetchTokensWithRetry(0);
  }, [fetchTokensWithRetry]);

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
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
