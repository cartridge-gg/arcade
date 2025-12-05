import { Atom } from "@effect-atom/atom-react";
import { Effect, Stream, Data, Layer, Option } from "effect";
import { getChecksumAddress, addAddressPadding } from "starknet";
import { fetchTokenBalances } from "@cartridge/arcade/marketplace";
import type { TokenBalance } from "@dojoengine/torii-wasm";
import { accountsMapAtom } from "./users";

const LIMIT = 1000;

export type MarketplaceHolder = {
  address: string;
  balance: number;
  token_ids: string[];
  username?: string;
  ratio: number;
};

export type TokenBalancesState = {
  balances: TokenBalance[];
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

type BalanceMap = Map<string, { balance: bigint; tokenIds: string[] }>;

const filterValidBalances = (balances: TokenBalance[]) =>
  balances.filter((b) => b.token_id);

const aggregateByAccount = (balances: TokenBalance[]): BalanceMap => {
  const map: BalanceMap = new Map();
  for (const b of balances) {
    const value = BigInt(b.balance);
    if (value === 0n) continue;
    const addr = getChecksumAddress(b.account_address);
    if (BigInt(addr) === 0n) continue;
    const entry = map.get(addr);
    if (entry) {
      entry.balance += value;
      if (b.token_id) entry.tokenIds.push(b.token_id);
    } else {
      map.set(addr, {
        balance: value,
        tokenIds: b.token_id ? [b.token_id] : [],
      });
    }
  }
  return map;
};

const buildHolders = (
  balanceMap: BalanceMap,
  usernamesMap: Map<string, string>,
): Omit<HoldersState, "hasMore"> => {
  const totalBalance = [...balanceMap.values()].reduce(
    (sum, o) => sum + Number(o.balance),
    0,
  );
  const holders = [...balanceMap.entries()]
    .map(([address, data]) => ({
      address,
      balance: Number(data.balance),
      token_ids: data.tokenIds,
      username: usernamesMap.get(address),
      ratio:
        totalBalance > 0
          ? Math.round((Number(data.balance) / totalBalance) * 1000) / 10
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
      const result = yield* Effect.tryPromise({
        try: () =>
          fetchTokenBalances({
            project,
            contractAddresses: [normalizedAddress],
            cursor,
            limit: LIMIT,
          }),
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

      const balances = result.page?.balances ?? [];
      const nextCursor = result.page?.nextCursor;
      const hasMore = !!nextCursor;

      return [{ balances, hasMore }, Option.fromNullable(nextCursor)] as const;
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

const holdersRuntime = Atom.runtime(Layer.empty);

const tokenBalancesFamily = Atom.family((key: string) => {
  const { project, contractAddress }: AtomKey = JSON.parse(key);
  return holdersRuntime
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

    const filteredBalances = filterValidBalances(balancesResult.value.balances);
    const balanceMap = aggregateByAccount(filteredBalances);
    const { holders, totalBalance } = buildHolders(
      balanceMap,
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
