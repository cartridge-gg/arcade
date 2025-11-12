import {
  createCollection,
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";
import { tokenContractsCollection } from "./tokens";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient, queryKeys } from "@/queries";
import { ToriiGrpcClient } from "@dojoengine/grpc";
import { DEFAULT_PROJECT } from "@/constants";
import { getToriiUrl } from "@cartridge/arcade";

export type Ownership = {
  contractAddress: string;
  accountAddress: string;
  tokenId: bigint;
  balance: bigint;
};

// Arcade Game `token_contract` collection to dynamically retrieve address
const arcadeCollectionAddress = createLiveQueryCollection({
  startSync: true,
  query: (q) =>
    q
      .from({ collections: tokenContractsCollection })
      .where(({ collections }) => eq(collections.name, "Arcade Game"))
      .select(({ collections }) => ({ ...collections })),
});

// Fetch `token_balances` for `Arcade Game` collection;
const arcadeCollectionOwnerships = createCollection(
  queryCollectionOptions({
    queryKey: queryKeys.ownerships.arcade,
    queryFn: async () => {
      await arcadeCollectionAddress.stateWhenReady();
      const arcadeCollection = arcadeCollectionAddress.toArray[0];

      const client = new ToriiGrpcClient({
        toriiUrl: getToriiUrl(DEFAULT_PROJECT),
        worldAddress: "0x0",
      });
      const res = await client.getTokenBalances({
        contract_addresses: [arcadeCollection.contract_address.toLowerCase()],
        account_addresses: [],
        token_ids: [],
        pagination: {
          limit: 10000,
          direction: "Forward",
          order_by: [],
          cursor: undefined,
        },
      });
      const balances: Ownership[] = [];
      for (const balance of res.items) {
        const b = BigInt(balance.balance);
        if (b === 0n) {
          continue;
        }
        balances.push({
          contractAddress: balance.contract_address,
          accountAddress: balance.account_address,
          tokenId: BigInt(balance.token_id ?? "0x0"),
          balance: BigInt(balance.balance),
        });
      }
      return balances;
    },
    queryClient,
    getKey: (item: Ownership) => item.tokenId.toString(),
  }),
);

export function useOwnershipsCollection() {
  const { data, ...rest } = useLiveQuery(arcadeCollectionOwnerships);
  if (!data || data.length < 1) {
    return { data: [], ...rest };
  }

  return { data: data, ...rest };
}
