import { Atom } from "@effect-atom/atom-react";
import { Effect, Stream, Data, Option } from "effect";
import { getChecksumAddress, addAddressPadding } from "starknet";
import { toriiRuntime } from "../layers/arcade";
import type { TokenBalance } from "@dojoengine/torii-wasm";
import { accountsMapAtom } from "./users";
import { ToriiGrpcClient } from "../runtime";

const LIMIT = 100;

export type MarketplaceHolder = {
  address: string;
  balance: number;
  token_ids: string[];
  username?: string;
  ratio: number;
};

type HolderTokenCount = {
  account_address: string;
  token_count: BigInt;
};

export type TokenBalancesState = {
  balances: HolderTokenCount[];
  hasMore: boolean;
};

export type HoldersState = {
  holders: MarketplaceHolder[];
  totalBalance: number;
  hasMore: boolean;
};

class TokenBalancesError extends Data.TaggedError("TokenBalancesError")<{
  message: string;
}> {}

type AtomKey = {
  project: string;
  contractAddress: string;
};

const buildHolders = (
  balanceMap: HolderTokenCount[],
  usernamesMap: Map<string, string>,
): Omit<HoldersState, "hasMore"> => {
  const totalBalance = [...balanceMap.values()].reduce(
    (sum, o) => sum + Number(o.token_count),
    0,
  );
  const holders = balanceMap
    .map((i) => ({
      address: getChecksumAddress(i.account_address),
      balance: Number(i.token_count),
      token_ids: [],
      username: usernamesMap.get(getChecksumAddress(i.account_address)),
      ratio:
        totalBalance > 0
          ? Math.round((Number(i.token_count) / totalBalance) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.balance - a.balance);
  return { holders, totalBalance };
};

const fetchTokenBalancesStream = (
  project: string,
  contractAddress: string,
): Stream.Stream<TokenBalancesState, TokenBalancesError> => {
  const normalizedAddress = addAddressPadding(contractAddress);

  return Stream.paginateEffect(undefined as string | undefined, (cursor) =>
    Effect.gen(function* () {
      const { client } = yield* ToriiGrpcClient;
      const result = yield* Effect.tryPromise({
        try: () =>
          client.executeSql(`SELECT 
                    account_address,
                    COUNT(*) as token_count
                FROM token_balances
                WHERE contract_address = '${normalizedAddress}' AND account_address != '0x0000000000000000000000000000000000000000000000000000000000000001'
                  AND balance != '0x0000000000000000000000000000000000000000000000000000000000000000'
                GROUP BY account_address
                ORDER BY token_count DESC
                LIMIT ${LIMIT}
                OFFSET ${cursor ?? 0}`),
        catch: (error) =>
          new TokenBalancesError({
            message: error instanceof Error ? error.message : String(error),
          }),
      });

      if (result.error) {
        return yield* Effect.fail(
          new TokenBalancesError({ message: result.error.error.message }),
        );
      }

      const balances = result ?? [];
      const nextCursor = (cursor ?? 0) + LIMIT;
      const hasMore = result.length === LIMIT;

      return [
        { balances, hasMore },
        hasMore ? Option.some(nextCursor) : Option.none(),
      ] as const;
    }),
  ).pipe(
    Stream.scan(
      { balances: [] as TokenBalance[], hasMore: true } as TokenBalancesState,
      (acc, page) => ({
        balances: [...acc.balances, ...page.balances],
        hasMore: page.hasMore,
      }),
    ),
  );
};

const tokenBalancesFamily = Atom.family((key: string) => {
  const { project, contractAddress }: AtomKey = JSON.parse(key);
  return toriiRuntime
    .atom(fetchTokenBalancesStream(project, contractAddress), {
      initialValue: { balances: [], hasMore: true },
    })
    .pipe(Atom.keepAlive);
});

export const tokenBalancesAtom = (project: string, contractAddress: string) => {
  if (!contractAddress) {
    return tokenBalancesFamily(
      JSON.stringify({ project, contractAddress: "" }),
    );
  }
  const normalizedAddress = addAddressPadding(contractAddress);
  const key = JSON.stringify({ project, contractAddress: normalizedAddress });
  return tokenBalancesFamily(key);
};

const holdersFamily = Atom.family((key: string) => {
  const { project, contractAddress }: AtomKey = JSON.parse(key);

  return Atom.make((get) => {
    const balancesResult = get(tokenBalancesAtom(project, contractAddress));
    const usernamesResult = get(accountsMapAtom);

    if (balancesResult._tag !== "Success") return balancesResult;
    if (usernamesResult._tag !== "Success") return usernamesResult;

    const { holders, totalBalance } = buildHolders(
      balancesResult.value.balances,
      usernamesResult.value,
    );

    return {
      ...balancesResult,
      value: { holders, totalBalance, hasMore: balancesResult.value.hasMore },
    };
  });
});

export const holdersAtom = (project: string, contractAddress: string) => {
  if (!contractAddress) {
    return holdersFamily(JSON.stringify({ project, contractAddress: "" }));
  }
  const normalizedAddress = addAddressPadding(contractAddress);
  const key = JSON.stringify({ project, contractAddress: normalizedAddress });
  return holdersFamily(key);
};
