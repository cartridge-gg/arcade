import { useEffect, useMemo } from "react";
import { addAddressPadding } from "starknet";
import type { Token } from "@dojoengine/torii-wasm";
import { useMarketplaceCollectionTokens } from "@cartridge/arcade/marketplace/react";
import { useMarketplaceTokensStore } from "@/store";
import { DEFAULT_PROJECT } from "@/constants";
import { fetchTokenImage } from "./fetcher-utils";

interface UseListedTokensFetcherInput {
  collectionAddress: string;
  tokenIds: string[];
  enabled?: boolean;
}

export function useListedTokensFetcher({
  collectionAddress,
  tokenIds,
  enabled = true,
}: UseListedTokensFetcherInput) {
  const setListedTokens = useMarketplaceTokensStore(
    (state) => state.setListedTokens,
  );

  const normalizedAddress = useMemo(() => {
    if (!collectionAddress) return "";
    try {
      return addAddressPadding(collectionAddress);
    } catch (error) {
      console.warn("Invalid contract address in useListedTokensFetcher", {
        collectionAddress,
        error,
      });
      return "";
    }
  }, [collectionAddress]);

  const queryOptions = useMemo(() => {
    return {
      address: normalizedAddress,
      tokenIds,
      limit: tokenIds.length || 100,
    };
  }, [normalizedAddress, tokenIds]);

  const shouldFetch =
    enabled && normalizedAddress.length > 0 && tokenIds.length > 0;

  const { data, status, error } = useMarketplaceCollectionTokens(
    queryOptions,
    shouldFetch,
  );

  useEffect(() => {
    if (!data || !data.page || data.error) return;

    const page = data.page;
    if (!page.tokens.length) return;

    (async () => {
      const enriched = await Promise.all(
        page.tokens.map(async (token) => {
          const image = await fetchTokenImage(
            token as Token,
            DEFAULT_PROJECT,
            true,
          );
          return { ...token, image };
        }),
      );

      setListedTokens(DEFAULT_PROJECT, collectionAddress, enriched as Token[]);
    })().catch((err) => {
      console.error("Failed to enrich listed tokens", err);
    });
  }, [data, collectionAddress, setListedTokens]);

  return {
    status,
    error: data?.error?.error ?? error ?? null,
  };
}
