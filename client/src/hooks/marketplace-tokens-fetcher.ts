import { fetchToriis, fetchToriisStream } from "@cartridge/arcade";
import { Token, Tokens, ToriiClient } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChecksumAddress } from "starknet";
import { useMarketCollectionFetcher } from "./marketplace-fetcher";
import { useMarketplaceTokensStore } from "@/store";
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
import {
  buildMetadataIndex,
  updateMetadataIndex,
} from "@/utils/metadata-indexer";

type MarketTokensFetcherInput = {
  project: string[];
  address: string;
  autoFetch?: boolean;
};

const LIMIT = 100;

type FetchMode = "append" | "reset";

export function useMarketTokensFetcher({
  project,
  address,
}: MarketTokensFetcherInput) {
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

  const editions = useEditionsMap();

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const queryHandleRef = useRef<boolean>();

  const { collections } = useMarketCollectionFetcher({ projects: project });
  console.log(collections);
  const collection = useMemo(
    () => collections.find((c) => c.contract_address === address) ?? null,
    [collections, address],
  );

  const addTokens = useMarketplaceTokensStore((state) => state.addTokens);
  // const updateLoadingState = useMarketplaceTokensStore(
  //   (state) => state.updateLoadingState,
  // );
  // const getLoadingState = useMarketplaceTokensStore(
  //   (state) => state.getLoadingState,
  // );
  // const clearTokens = useMarketplaceTokensStore((state) => state.clearTokens);
  // const getTokens = useMarketplaceTokensStore((state) => state.getTokens);
  // const getOwners = useMarketplaceTokensStore((state) => state.getOwners);
  //
  // const { setMetadataIndex, getCollectionState } = useMetadataFilterStore();

  const processTokens = useCallback(async (tokens: Tokens) => {
    const data = [];
    for (const token of tokens) {
      const metadata = parseJsonSafe(token.metadata, token.metadata);
      const image = await fetchTokenImage(token, "arcade-main", true);

      data.push({
        ...token,
        contract_address: getChecksumAddress(token.contract_address),
        metadata,
        image,
      } as Token);
    }
    return data;
  }, []);

  const fetchData = useCallback(
    async (cursor: string | undefined) => {
      const tokens = await fetchToriis(["arcade-main"], {
        client: async ({ client }: { client: ToriiClient }) => {
          return await client.getTokens({
            contract_addresses: [address],
            token_ids: [],
            attribute_filters: [],
            pagination: {
              limit: LIMIT,
              cursor: cursor,
              direction: "Forward",
              order_by: [],
            },
          });
        },
      });

      for (const res of tokens.data) {
        setCursor(res.next_cursor);
        addTokens("arcade-main", { [address]: await processTokens(res.items) });
      }
    },
    [address, processTokens],
  );

  useEffect(() => {
    if (!cursor && !queryHandleRef.current) {
      queryHandleRef.current = true;
      fetchData(cursor);
    }
  });

  const fetchNextPage = useCallback(() => {
    console.log("fetchnextpage");
  }, []);

  return {
    collection,
    tokens: [],
    owners: [],
    status,
    isLoading,
    isError,
    errorMessage,
    loadingProgress,
    retryCount,
    getNextPage: fetchNextPage,
    hasMore,
    isPageLoading,
    nextCursor,
  };
}
