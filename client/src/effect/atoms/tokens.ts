import { Atom } from "@effect-atom/atom-react";
import { Effect, Array as A, pipe, Order, Data } from "effect";
import { getChecksumAddress } from "starknet";
import { ToriiGrpcClient } from "@dojoengine/react/effect";
import { toriiRuntime } from "../runtime";
import { BLACKLISTS, DEFAULT_PROJECT } from "@/constants";
import { fetchContractImage, fetchTokenImage } from "@/hooks/fetcher-utils";
import { MetadataHelper } from "@/lib/metadata";
import { mapResult } from "../utils/result";
import type {
  Token,
  TokenContract as TokenContractWasm,
} from "@dojoengine/torii-wasm";
import { formatBackgroundColor } from "@/hooks/token-fetcher";

class EnrichTokensError extends Data.TaggedError("EnrichTokensError")<{
  message: string;
}> {}

export type EnrichedTokenContract = {
  contract_address: string;
  name: string;
  symbol: string;
  metadata: string;
  total_supply: string;
  totalSupply: bigint;
  token_id: string | null;
  project: string;
  image: string;
  contract_type: CollectionType;
  background_color: string | null;
};

export enum CollectionType {
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

const fetchTokenContractsEffect = Effect.gen(function* () {
  const { client } = yield* ToriiGrpcClient;

  const contracts: Array<{
    contract_address: string;
    name: string;
    symbol: string;
    metadata: string;
    total_supply: string;
  }> = [];

  let result = yield* Effect.tryPromise(() =>
    client.getTokenContracts({
      contract_addresses: [],
      contract_types: [],
      pagination: {
        limit: 5,
        cursor: undefined,
        direction: "Forward",
        order_by: [],
      },
    }),
  );

  for (const item of result.items) {
    contracts.push({
      contract_address: item.contract_address,
      name: item.name ?? "",
      symbol: item.symbol ?? "",
      metadata: item.metadata ?? "",
      total_supply: item.total_supply ?? "0x0",
    });
  }

  while (result.next_cursor) {
    const cursor = result.next_cursor;
    result = yield* Effect.tryPromise(() =>
      client.getTokenContracts({
        contract_addresses: [],
        contract_types: [],
        pagination: {
          limit: 5,
          cursor,
          direction: "Forward",
          order_by: [],
        },
      }),
    );
    for (const item of result.items) {
      contracts.push({
        contract_address: item.contract_address,
        name: item.name ?? "",
        symbol: item.symbol ?? "",
        metadata: item.metadata ?? "",
        total_supply: item.total_supply ?? "0x0",
      });
    }
  }

  const tokenResults = yield* Effect.tryPromise({
    try: () =>
      client.executeSql(`
        SELECT contract_address, token_id, metadata
        FROM tokens
        WHERE token_id is not null
        GROUP BY contract_address
      `),
    catch: (error) =>
      new EnrichTokensError({
        message: error instanceof Error ? error.message : String(error),
      }),
  });

  const enrichedContracts = yield* Effect.all(
    contracts.map((contract) =>
      Effect.gen(function* () {
        const tokenData = tokenResults.find(
          (t) => t.contract_address === contract.contract_address,
        ) as
          | {
              contract_address: string;
              metadata: string;
              token_id: string;
            }
          | undefined;

        let metadata = contract.metadata;
        let tokenId: string | null = null;
        let backgroundColor: string | null =
          MetadataHelper.getMetadataField(
            contract.metadata,
            "background_color",
          ) ?? null;

        if (tokenData) {
          tokenId = tokenData.token_id || null;
          if (metadata === "" && tokenData.metadata !== "") {
            metadata = tokenData.metadata;
          }
          if (!backgroundColor && tokenData.metadata !== "") {
            backgroundColor =
              MetadataHelper.getMetadataField(
                tokenData.metadata,
                "background_color",
              ) ?? null;
          }
        }

        backgroundColor = formatBackgroundColor(backgroundColor);

        const image = yield* Effect.tryPromise(async () => {
          if (!contract.metadata) {
            return fetchTokenImage(
              { ...contract, metadata, token_id: tokenId } as unknown as Token,
              DEFAULT_PROJECT,
              true,
            );
          }
          return fetchContractImage(
            contract as unknown as TokenContractWasm,
            DEFAULT_PROJECT,
          );
        });

        return {
          contract_address: getChecksumAddress(contract.contract_address),
          name: contract.name,
          symbol: contract.symbol,
          metadata,
          total_supply: contract.total_supply ?? "0x0",
          totalSupply: BigInt(contract.total_supply ?? "0x0"),
          token_id: tokenId,
          project: DEFAULT_PROJECT,
          image: image ?? "",
          contract_type: CollectionType.ERC721,
          background_color: backgroundColor,
        } satisfies EnrichedTokenContract;
      }),
    ),
    { concurrency: 5 },
  );

  const byName = Order.mapInput(
    Order.string,
    (c: EnrichedTokenContract) => c.name ?? "",
  );

  return pipe(
    enrichedContracts,
    A.filter(
      (c: EnrichedTokenContract) =>
        !BLACKLISTS.includes(c.contract_address as (typeof BLACKLISTS)[number]),
    ),
    A.sort(byName),
  );
});

export const tokenContractsAtom = toriiRuntime
  .atom(fetchTokenContractsEffect)
  .pipe(Atom.keepAlive);

const nullContractResultAtom = Atom.make(
  () => ({ _tag: "Success", value: null }) as const,
);

export const tokenContractAtom = Atom.family((address: string | undefined) => {
  if (!address) return nullContractResultAtom;

  return tokenContractsAtom.pipe(
    Atom.map((result) =>
      mapResult(
        result,
        (contracts) =>
          contracts.find(
            (c) => c.contract_address.toLowerCase() === address.toLowerCase(),
          ) ?? null,
      ),
    ),
  );
});
