import { fetchToriis } from "@cartridge/arcade";
import { Token, ToriiClient } from "@dojoengine/torii-wasm";
import { useCallback, useEffect, useRef, useState } from "react";
import { getChecksumAddress } from "starknet";
import { useMarketplaceTokensStore } from "@/store";
import { useTokenContract } from "@/collections";
import {
  useFetcherState,
  fetchTokenImage,
  parseJsonSafe,
} from "./fetcher-utils";

type MarketTokensFetcherInput = {
  project: string[];
  address: string;
  autoFetch?: boolean;
};

const LIMIT = 100;

type TokenPage = Awaited<ReturnType<ToriiClient["getTokens"]>>;

export function useMarketTokensFetcher({
  project,
  address,
  autoFetch = true,
}: MarketTokensFetcherInput) {
  const {
    status,
    isLoading,
    isError,
    errorMessage,
    loadingProgress,
    retryCount,
  } = useFetcherState(true);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const projectId = project[0] ?? "arcade-main";

  const normalizedAddress = (() => {
    if (!address) return "";
    try {
      return getChecksumAddress(address);
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
  })();

  const collection = useTokenContract(normalizedAddress);

  const addTokens = useMarketplaceTokensStore((state) => state.addTokens);
  const getTokens = useMarketplaceTokensStore((state) => state.getTokens);

  const processTokens = useCallback(
    async (tokens: Token[]) => {
      const data: Token[] = [];

      for (const token of tokens) {
        const metadata = parseJsonSafe(token.metadata, token.metadata);
        const image = await fetchTokenImage(token, projectId, true);

        data.push({
          ...token,
          contract_address: getChecksumAddress(token.contract_address),
          metadata,
          image,
        } as Token);
      }

      return data;
    },
    [projectId],
  );

  const fetchData = useCallback(
    async (currentCursor: string | undefined) => {
      if (isFetchingRef.current) return;
      if (!projectId || !normalizedAddress) return;
      if (!address) return;

      isFetchingRef.current = true;

      try {
        const tokens = await fetchToriis(
          project.length ? project : [projectId],
          {
            client: async ({ client }) => {
              return client.getTokens({
                contract_addresses: [address],
                token_ids: [],
                attribute_filters: [],
                pagination: {
                  limit: LIMIT,
                  cursor: currentCursor,
                  direction: "Forward",
                  order_by: [],
                },
              });
            },
          },
        );

        const pages = tokens.data as TokenPage[];
        let nextCursorValue: string | undefined;

        for (const res of pages) {
          nextCursorValue = res.next_cursor;
          addTokens(projectId, {
            [address]: await processTokens(res.items),
          });
        }

        setCursor(nextCursorValue);
      } catch (error) {
        console.error("Error fetching marketplace tokens:", error);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [address, addTokens, processTokens, project, projectId, normalizedAddress],
  );

  useEffect(() => {
    if (!autoFetch) return;
    if (hasInitializedRef.current) return;
    if (!projectId || !normalizedAddress) return;
    if (collection === null) return;

    hasInitializedRef.current = true;
    void fetchData(undefined);
  }, [autoFetch, collection, fetchData, normalizedAddress, projectId]);

  const fetchNextPage = useCallback(() => {
    if (!cursor) return;
    void fetchData(cursor);
  }, [cursor, fetchData]);

  return {
    collection,
    tokens: getTokens(projectId, address),
    owners: [],
    status,
    isLoading,
    isError,
    errorMessage,
    loadingProgress,
    retryCount,
    hasMore: Boolean(cursor),
    isFetchingNextPage: isFetchingRef.current,
    fetchNextPage,
  };
}
