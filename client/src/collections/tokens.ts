import {
  createCollection,
  eq,
  inArray,
  not,
  useLiveQuery,
} from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryKeys } from "@/queries/keys";
import { queryClient } from "@/queries";
import { Token, TokenContract, ToriiClient } from "@dojoengine/torii-wasm";
import { getChecksumAddress } from "starknet";
import { BLACKLISTS, DEFAULT_PROJECT } from "@/constants";
import { fetchTokenImage } from "@/hooks/fetcher-utils";

export const tokenContractsCollection = createCollection(
  queryCollectionOptions({
    queryKey: queryKeys.tokens.collections,
    queryFn: async () => {
      const client = await new ToriiClient({
        toriiUrl: `https://api.cartridge.gg/x/${DEFAULT_PROJECT}/torii`,
        worldAddress: "0x0",
      });
      const contracts = await client.getTokenContracts({
        contract_addresses: [],
        contract_types: [],
        pagination: {
          limit: 100,
          cursor: undefined,
          direction: "Forward",
          order_by: [],
        },
      });
      const data = await Promise.all(
        contracts.items.map(async (contract) => {
          const token = await client.getTokens({
            contract_addresses: [contract.contract_address],
            token_ids: [],
            attribute_filters: [],
            pagination: {
              limit: 1,
              cursor: undefined,
              direction: "Forward",
              order_by: [],
            },
          });
          const enrichedContract = { ...contract, token_id: undefined };
          if (token.items.length > 0) {
            const t = token.items[0];
            if (enrichedContract.metadata === "" && t.metadata !== "") {
              enrichedContract.metadata = token.items[0].metadata;
            }
            // @ts-expect-error trust me i'm an engineer
            enrichedContract.token_id = token.items[0].token_id;
          }

          const image = await fetchTokenImage(
            enrichedContract as Token,
            DEFAULT_PROJECT,
            false,
          );
          return {
            ...enrichedContract,
            contract_address: getChecksumAddress(contract.contract_address),
            total_supply: enrichedContract.total_supply ?? "0x0",
            totalSupply: BigInt(enrichedContract.total_supply ?? "0x0"),
            token_id: enrichedContract.token_id ?? null,
            project: DEFAULT_PROJECT,
            image,
          };
        }),
      );
      return data;
    },
    queryClient,
    getKey: (item: TokenContract) => item.contract_address,
  }),
);

export function useTokenContracts() {
  const { data, ...rest } = useLiveQuery((q) =>
    q
      .from({ collections: tokenContractsCollection })
      .where(({ collections }) =>
        not(inArray(collections.contract_address, BLACKLISTS)),
      )
      .orderBy(({ collections }) => collections.name)
      .select(({ collections }) => ({ ...collections })),
  );
  if (!data) {
    return { data: [], ...rest };
  }

  return { data, ...rest };
}

export function useTokenContract(address: string) {
  const { data } = useLiveQuery((q) =>
    q
      .from({ collections: tokenContractsCollection })
      .where(({ collections }) => eq(collections.contract_address, address))
      .select(({ collections }) => ({ ...collections })),
  );
  if (data.length === 1) return data[0];
  return null;
}
