import { useEditionsMap } from "@/collections";
import { Contract, useMarketplaceStore } from "@/store";
import { fetchToriisStream } from "@cartridge/arcade";
import { useEffect, useCallback, useRef } from "react";
import { getChecksumAddress } from "starknet";
import { Token } from "@dojoengine/torii-wasm";
import {
  useFetcherState,
  fetchTokenImage,
  processToriiStream
} from "./fetcher-utils";

type UseMarketplaceFetcherParams = {
  projects: string[];
}


const TOKENS_SQL = (limit: number = 5000, offset: number = 0) => `
  SELECT t.*, c.contract_type
  FROM tokens t
  INNER JOIN contracts c on c.contract_address = t.contract_address
  WHERE metadata is not null
  GROUP BY c.contract_address
  LIMIT ${limit} OFFSET ${offset};
`;

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
  const getFlattenCollections = useMarketplaceStore((s) => s.getFlattenCollections);

  const processTokens = useCallback(
    async (contracts: Contract[], project: string): Promise<{ [address: string]: Contract }> => {
      const collections: { [address: string]: Contract } = {};

      for (const c of contracts) {
        const address = getChecksumAddress(c.contract_address);
        if (address in collections) {
          collections[address].total_supply = collections[address].total_supply ?? c.total_supply ?? "0x0";
          continue;
        }

        let metadata = null;
        try {
          metadata = JSON.parse(c.metadata);
        } catch (_err) {
          console.error('failed to parse json metadata for ', project);
        }

        collections[address] = {
          ...c,
          contract_address: address,
          total_supply: c.total_supply ?? "0x0",
          totalSupply: BigInt(c.total_supply ?? "0x0"),
          token_id: c.token_id ?? null,
          metadata,
          project,
          image: await fetchTokenImage(c as Token, project, false),
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
        const stream = fetchToriisStream(
          projects,
          {
            sql: TOKENS_SQL(limit, 0)
            // client: async function* ({ client }) {
            //   const contracts = await client.getTokenContracts({ contract_addresses: [], contract_types: ['ERC721', 'ERC1155'], pagination: {limit: 1000, cursor: undefined, direction: 'Forward', order_by: []}});
            //   console.log(contracts);
            // },native: true,
          },
        );

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
