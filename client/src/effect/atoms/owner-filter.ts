import { Atom } from "@effect-atom/atom-react";
import { Effect, Data } from "effect";
import { addAddressPadding } from "starknet";
import { toriiRuntime } from "../layers/arcade";
import { ToriiGrpcClient } from "../runtime";

type OwnerTokenBalance = {
  token_id: string;
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
          const id = b.token_id.replace(`${normalizedContract}:0x`, "");
          try {
            return id;
          } catch {
            return id;
          }
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
