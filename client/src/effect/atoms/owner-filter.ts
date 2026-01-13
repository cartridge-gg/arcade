import { Atom } from "@effect-atom/atom-react";
import { Effect, Data } from "effect";
import { addAddressPadding } from "starknet";
import { toriiRuntime } from "../layers/arcade";
import { ToriiGrpcClient } from "../runtime";

type OwnerTokenBalance = {
  token_id: string;
  account_address?: string;
};

class OwnerTokensError extends Data.TaggedError("OwnerTokensError")<{
  message: string;
}> {}

type AtomKey = {
  contractAddress: string;
  ownerAddress: string;
};

const fetchOwnerTokenIds = (contractAddress: string, ownerAddress: string) =>
  Effect.gen(function* () {
    const { client } = yield* ToriiGrpcClient;
    const normalizedContract = addAddressPadding(contractAddress).toLowerCase();
    const normalizedOwner = addAddressPadding(ownerAddress).toLowerCase();

    const result = yield* Effect.tryPromise({
      try: () =>
        client.executeSql(`SELECT token_id
          FROM token_balances
          WHERE contract_address = '${normalizedContract}'
            AND account_address = '${normalizedOwner}'
            AND balance != '0x0000000000000000000000000000000000000000000000000000000000000000'`),
      catch: (error) =>
        new OwnerTokensError({
          message: error instanceof Error ? error.message : String(error),
        }),
    });

    const balances = (result ?? []) as unknown as OwnerTokenBalance[];
    return new Set(
      balances
        .map((b) => {
          const id =
            b.token_id
              .replace(`${normalizedContract}:0x`, "")
              .replace(/^0+/, "") || "0";
          return id;
        })
        .filter(Boolean),
    );
  });

const emptySetAtom = Atom.make(() => ({
  _tag: "Success" as const,
  value: new Set<string>(),
}));

const ownerTokenIdsFamily = Atom.family((key: string) => {
  const { contractAddress, ownerAddress }: AtomKey = JSON.parse(key);
  if (!contractAddress || !ownerAddress) {
    return emptySetAtom;
  }
  return toriiRuntime.atom(fetchOwnerTokenIds(contractAddress, ownerAddress));
});

export const ownerTokenIdsAtom = (
  contractAddress: string,
  ownerAddress: string | undefined,
) => {
  if (!contractAddress || !ownerAddress) {
    return emptySetAtom;
  }
  const normalizedContract = addAddressPadding(contractAddress).toLowerCase();
  const normalizedOwner = addAddressPadding(ownerAddress).toLowerCase();
  const key = JSON.stringify({
    contractAddress: normalizedContract,
    ownerAddress: normalizedOwner,
  });
  return ownerTokenIdsFamily(key);
};

export type OwnershipMap = Map<string, Set<string>>;

export const fetchCollectionOwnershipMap = (
  contractAddress: string,
  ownerAddresses: string[],
) =>
  Effect.gen(function* () {
    const { client } = yield* ToriiGrpcClient;
    const normalizedContract = addAddressPadding(contractAddress).toLowerCase();
    const normalizedOwners = ownerAddresses.map((addr) =>
      addAddressPadding(addr).toLowerCase(),
    );

    if (normalizedOwners.length === 0) {
      return new Map<string, Set<string>>();
    }

    const ownerList = normalizedOwners.map((o) => `'${o}'`).join(",");

    const result = yield* Effect.tryPromise({
      try: () =>
        client.executeSql(`SELECT account_address, token_id
          FROM token_balances
          WHERE contract_address = '${normalizedContract}'
            AND account_address IN (${ownerList})
            AND balance != '0x0000000000000000000000000000000000000000000000000000000000000000'`),
      catch: (error) =>
        new OwnerTokensError({
          message: error instanceof Error ? error.message : String(error),
        }),
    });

    const ownershipMap = new Map<string, Set<string>>();
    const balances = (result ?? []) as unknown as OwnerTokenBalance[];
    for (const row of balances) {
      if (!row.account_address || !row.token_id) continue;
      const owner = row.account_address.toLowerCase();
      const tokenId =
        row.token_id
          .replace(`${normalizedContract}:0x`, "")
          .replace(/^0+/, "") || "0";
      if (!ownershipMap.has(owner)) {
        ownershipMap.set(owner, new Set());
      }
      ownershipMap.get(owner)!.add(tokenId);
    }
    return ownershipMap;
  });

type CollectionOwnershipKey = {
  contractAddress: string;
  ownerAddresses: string[];
};

const emptyOwnershipAtom = Atom.make(() => ({
  _tag: "Success" as const,
  value: new Map<string, Set<string>>(),
}));

const collectionOwnershipFamily = Atom.family((key: string) => {
  const { contractAddress, ownerAddresses }: CollectionOwnershipKey =
    JSON.parse(key);
  if (!contractAddress || ownerAddresses.length === 0) {
    return emptyOwnershipAtom;
  }
  return toriiRuntime.atom(
    fetchCollectionOwnershipMap(contractAddress, ownerAddresses),
  );
});

export const collectionOwnershipAtom = (
  contractAddress: string,
  ownerAddresses: string[],
) => {
  if (!contractAddress || ownerAddresses.length === 0) {
    return emptyOwnershipAtom;
  }
  const normalizedContract = addAddressPadding(contractAddress).toLowerCase();
  const normalizedOwners = ownerAddresses.map((addr) =>
    addAddressPadding(addr).toLowerCase(),
  );
  const key = JSON.stringify({
    contractAddress: normalizedContract,
    ownerAddresses: normalizedOwners,
  });
  return collectionOwnershipFamily(key);
};
