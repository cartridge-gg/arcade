import { useEditionsMap } from "@/collections";
import { Contract, useMarketplaceStore } from "@/store";
import { fetchToriisStream } from "@cartridge/arcade";
import { useEffect, useCallback, useRef } from "react";
import { getChecksumAddress } from "starknet";
import { Token } from "@dojoengine/torii-wasm";
import {
  useFetcherState,
  fetchTokenImage,
  processToriiStream,
} from "./fetcher-utils";
import { BLACKLISTS } from "@/constants";

type UseMarketplaceFetcherParams = {
  projects: string[];
};

export function useMarketCollectionFetcher({
  projects,
}: UseMarketplaceFetcherParams) {
  const {
    status,
    isLoading,
    isError,
    editionError,
    loadingProgress,
    startLoading,
    setSuccess,
    setError,
    setLoadingProgress,
  } = useFetcherState();
  const hasInitialFetch = useRef(false);

  const editions = useEditionsMap();
  const addCollections = useMarketplaceStore((s) => s.addCollections);
  const getFlattenCollections = useMarketplaceStore(
    (s) => s.getFlattenCollections,
  );

  const processTokens = useCallback(
    async (
      contracts: Contract[],
      project: string,
    ): Promise<{ [address: string]: Contract }> => {
      const collections: { [address: string]: Contract } = {};

      for (const c of contracts) {
        if (BLACKLISTS.includes(BigInt(c.contract_address))) {
          continue;
        }
        const address = getChecksumAddress(c.contract_address);
        if (address in collections) {
          collections[address].total_supply =
            collections[address].total_supply ?? c.total_supply ?? "0x0";
          continue;
        }

        let metadata = null;
        try {
          metadata = JSON.parse(c.metadata);
        } catch (_err) {
          console.error("failed to parse json metadata for ", project);
        }

        const image = await fetchTokenImage(c as Token, project, false);

        collections[address] = {
          ...c,
          contract_address: address,
          total_supply: c.total_supply ?? "0x0",
          totalSupply: BigInt(c.total_supply ?? "0x0"),
          token_id: c.token_id ?? null,
          metadata,
          project,
          image,
        };
      }

      return collections;
    },
    [],
  );

  const fetchData = useCallback(
    async (quickLoad: boolean = false) => {
      if (projects.length === 0) return;

      startLoading();

      try {
        const limit = quickLoad ? 500 : 5000;
        const stream = fetchToriisStream(projects, {
          client: async function* ({ client }) {
            const contracts = await client.getTokenContracts({
              contract_addresses: [],
              contract_types: ["ERC721", "ERC1155"],
              account_addresses: [],
              token_ids: [],
              pagination: {
                limit,
                cursor: undefined,
                direction: "Forward",
                order_by: [],
              },
            });
            for (const c of contracts.items) {
              const token = await client.getTokens({
                contract_addresses: [c.contract_address],
                token_ids: [],
                attribute_filters: [],
                pagination: {
                  limit: 1,
                  cursor: undefined,
                  direction: "Forward",
                  order_by: [],
                },
              });
              if (token.items.length > 0) {
                const t = token.items[0];
                if (c.metadata === "" && t.metadata !== "") {
                  c.metadata = token.items[0].metadata;
                }
                // @ts-expect-error trust me i'm an engineer
                c.token_id = token.items[0].token_id;
              }
            }
            yield contracts.items;
          },
        });

        await processToriiStream(stream, {
          onData: async (data: any, endpoint: string) => {
            const tokensData: Contract[] = data;

            if (Array.isArray(tokensData)) {
              const projectCollections = await processTokens(
                tokensData,
                endpoint,
              );

              addCollections({ [endpoint]: projectCollections });
            }
          },
          onProgress: (completed, total) => {
            setLoadingProgress({ completed, total });
          },
          onError: (endpoint, error) => {
            console.error(
              `Error fetching collections from ${endpoint}:`,
              error,
            );
            const e = editions.get(endpoint);
            setError(e, "Error fetching marketplace collections");
          },
          onComplete: () => {
            setSuccess();
          },
        });
      } catch (error) {
        console.error("Error fetching marketplace collections:", error);
        // Set error for all editions
        for (const project of projects) {
          const e = editions.get(project);
          if (e) {
            setError(e, "Error fetching marketplace collections");
          }
        }
      }
    },
    [
      projects,
      processTokens,
      addCollections,
      startLoading,
      setSuccess,
      setError,
      setLoadingProgress,
      editions,
    ],
  );

  useEffect(() => {
    if (projects.length > 0 && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchData(false);
    }
  }, [projects]); // Remove fetchData from dependencies to avoid infinite loop

  return {
    collections: getFlattenCollections(projects),
    status,
    isLoading,
    isError,
    editionError,
    loadingProgress,
    refetch: fetchData,
  };
}
