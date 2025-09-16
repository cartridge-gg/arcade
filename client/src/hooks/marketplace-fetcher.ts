import { Contract, useMarketplaceStore } from "@/store";
import { fetchToriisStream } from "@cartridge/arcade";
import { useState, useEffect, useCallback, useRef } from "react";
import { getChecksumAddress } from "starknet";
import { Token } from "@dojoengine/torii-wasm";
import { MetadataHelper } from "@/helpers/metadata";

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
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{
    completed: number;
    total: number;
  }>({ completed: 0, total: 0 });
  const hasInitialFetch = useRef(false);

  const addCollections = useMarketplaceStore((s) => s.addCollections);
  const getFlattenCollections = useMarketplaceStore((s) => s.getFlattenCollections);

  const fetchImage = async (contract: Contract, project: string) => {
    const toriiImage = await MetadataHelper.getToriiImage(
      project,
      contract as Token,
    );
    if (toriiImage) {
      return toriiImage;
    }
    const metadataImage = await MetadataHelper.getMetadataImage(contract as Token);
    if (metadataImage) {
      return metadataImage;
    }
    return "";
  };

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
          image: await fetchImage(c, project),
        };

      }

      return collections;
    },
    [],
  );

  const fetchData = useCallback(
    async (quickLoad: boolean = false) => {
      if (projects.length === 0) return;

      setIsLoading(true);
      setStatus("loading");
      setIsError(false);
      setLoadingProgress({ completed: 0, total: projects.length });

      let hasError = false;

      try {
        const limit = quickLoad ? 500 : 5000;
        const stream = fetchToriisStream(
          projects,
          {
            sql: TOKENS_SQL(limit, 0)
            // client: async ({ client, signal }) => {
            //   // const contracts = await client.getTokenCollections({ contract_addresses: [], account_addresses: [], token_ids: [], pagination: { limit, cursor: undefined, direction: 'Forward', order_by: [] } });
            //   const contracts = await client.getContracts({ contract_addresses: [], contract_types: ['ERC721', 'ERC1155'] });
            //   console.log(contracts);
            // },
            // pagination: {
            //   limit,
            // }
          },
        );

        for await (const result of stream) {
          setLoadingProgress({
            completed: result.metadata.completed,
            total: result.metadata.total,
          });

          if (result.error) {
            console.error(
              `Error fetching collections from ${result.endpoint}:`,
              result.error,
            );
            hasError = true;
          } else if (result.data) {
            const endpoint: string = result.data.endpoint || result.endpoint;
            const tokensData: Contract[] = result.data.data || result.data;

            if (Array.isArray(tokensData)) {
              const projectCollections = await processTokens(
                tokensData,
                endpoint,
              );

              addCollections({ [endpoint]: projectCollections });
            }
          }

          if (result.metadata.isLast) {
            setStatus(hasError ? "error" : "success");
            setIsError(hasError);
          }
        }
      } catch (error) {
        console.error("Error fetching marketplace collections:", error);
        setIsError(true);
        setStatus("error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      projects,
      processTokens,
      addCollections,
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
    loadingProgress,
    refetch: fetchData,
  };
}
