import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { ToriiGrpcClient } from "@dojoengine/react/effect";
import { toriiRuntime } from "../runtime";

export type Ownership = {
  contractAddress: string;
  accountAddress: string;
  tokenId: bigint;
  balance: bigint;
};

const fetchOwnershipsEffect = Effect.gen(function* () {
  const { client } = yield* ToriiGrpcClient;

  const tokenContractsResult = yield* Effect.tryPromise(async () => {
    const res = await client.getTokenContracts({
      contract_addresses: [],
      contract_types: [],
      pagination: {
        limit: 100,
        direction: "Forward",
        order_by: [],
        cursor: undefined,
      },
    });
    return res.items;
  });

  const arcadeCollection = tokenContractsResult.find(
    (c) => c.name === "Arcade Game",
  );

  if (!arcadeCollection) {
    return [] as Ownership[];
  }

  const res = yield* Effect.tryPromise(() =>
    client.getTokenBalances({
      contract_addresses: [arcadeCollection.contract_address.toLowerCase()],
      account_addresses: [],
      token_ids: [],
      pagination: {
        limit: 10000,
        direction: "Forward",
        order_by: [],
        cursor: undefined,
      },
    }),
  );

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
});

export const ownershipsAtom = toriiRuntime
  .atom(fetchOwnershipsEffect)
  .pipe(Atom.keepAlive);
