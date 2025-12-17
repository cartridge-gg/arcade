import { Atom } from "@effect-atom/atom-react";
import { Effect, Data, Layer } from "effect";
import { fetchCollectionTokens } from "@cartridge/arcade/marketplace";
import { addAddressPadding } from "starknet";
import type { Token } from "@dojoengine/torii-wasm";
import { fetchTokenImage } from "@/hooks/fetcher-utils";
import {
  collectionOrdersWithUsdAtom,
  type ListingWithUsd,
} from "./marketplace";

type ListedTokensKey = {
  project: string;
  address: string;
  tokenIds: string[];
};

export type EnrichedListedToken = Token & {
  orders: ListingWithUsd[];
  minUsdPrice: number | null;
};

class ListedTokensError extends Data.TaggedError("ListedTokensError")<{
  message: string;
}> {}

const fetchListedTokensEffect = (key: ListedTokensKey) =>
  Effect.gen(function* () {
    const result = yield* Effect.tryPromise({
      try: () =>
        fetchCollectionTokens({
          address: key.address,
          project: key.project,
          tokenIds: key.tokenIds,
          limit: key.tokenIds.length || 100,
          fetchImages: true,
        }),
      catch: (error) =>
        new ListedTokensError({
          message: error instanceof Error ? error.message : String(error),
        }),
    });

    if (result.error) {
      yield* Effect.fail(
        new ListedTokensError({
          message: result.error.error?.message ?? "Failed to fetch tokens",
        }),
      );
    }

    const tokens = (result.page?.tokens ?? []) as Token[];

    const enriched = yield* Effect.tryPromise({
      try: async () => {
        return Promise.all(
          tokens.map(async (token) => {
            const image = await fetchTokenImage(token, key.project, true);
            return { ...token, image };
          }),
        );
      },
      catch: () =>
        new ListedTokensError({ message: "Failed to enrich images" }),
    });

    return enriched as Token[];
  });

const listedTokensRuntime = Atom.runtime(Layer.empty);

const tokenFetchFamily = Atom.family((key: string) => {
  const parsed: ListedTokensKey = JSON.parse(key);

  if (!parsed.tokenIds?.length || !parsed.address) {
    return Atom.make(() => ({
      _tag: "Success" as const,
      value: [] as Token[],
    }));
  }

  return listedTokensRuntime
    .atom(fetchListedTokensEffect(parsed))
    .pipe(Atom.keepAlive);
});

const getOrdersForToken = (
  collectionOrders: { [token: string]: ListingWithUsd[] },
  rawTokenId?: string | bigint,
): ListingWithUsd[] => {
  if (!rawTokenId) return [];

  const candidates = new Set<string>();
  const tokenIdString = rawTokenId.toString();
  candidates.add(tokenIdString);

  try {
    if (tokenIdString.startsWith("0x")) {
      const numericId = BigInt(tokenIdString).toString();
      candidates.add(numericId);
    } else {
      const numericId = BigInt(tokenIdString).toString();
      candidates.add(numericId);
    }
  } catch {
    // Ignore parse errors
  }

  for (const candidate of candidates) {
    const orders = collectionOrders?.[candidate];
    if (orders?.length) {
      return orders;
    }
  }

  return [];
};

const listedTokensFamily = Atom.family((key: string) => {
  const parsed: ListedTokensKey = JSON.parse(key);

  if (!parsed.tokenIds?.length || !parsed.address) {
    return Atom.make(() => ({
      _tag: "Success" as const,
      value: [] as EnrichedListedToken[],
    }));
  }

  const fetchAtom = tokenFetchFamily(key);

  return Atom.make((get) => {
    const tokensResult = get(
      fetchAtom as Atom.Atom<{
        _tag: "Success" | "Initial" | "Failure";
        value?: Token[];
        error?: unknown;
      }>,
    );

    if (tokensResult._tag !== "Success" || !tokensResult.value) {
      return {
        _tag: tokensResult._tag,
        value: [] as EnrichedListedToken[],
        error: (tokensResult as any).error,
      };
    }

    const collectionOrders = get(collectionOrdersWithUsdAtom(parsed.address));

    const enrichedTokens = tokensResult.value.map((token) => {
      const orders = getOrdersForToken(collectionOrders, token.token_id);
      const minUsdPrice =
        orders.length > 0
          ? Math.min(
              ...orders.map((o) => o.usdPrice ?? Number.POSITIVE_INFINITY),
            )
          : null;

      return {
        ...token,
        orders,
        minUsdPrice:
          minUsdPrice === Number.POSITIVE_INFINITY ? null : minUsdPrice,
      } as EnrichedListedToken;
    });

    enrichedTokens.sort((a, b) => {
      if (a.minUsdPrice === null && b.minUsdPrice === null) return 0;
      if (a.minUsdPrice === null) return 1;
      if (b.minUsdPrice === null) return -1;
      return a.minUsdPrice - b.minUsdPrice;
    });

    return {
      _tag: "Success" as const,
      value: enrichedTokens,
    };
  });
});

export const listedTokensAtom = (
  project: string,
  address: string,
  tokenIds: string[],
) => {
  if (!address || !tokenIds?.length) {
    return listedTokensFamily(
      JSON.stringify({ project, address: "", tokenIds: [] }),
    );
  }

  const key = JSON.stringify({
    project,
    address: addAddressPadding(address),
    tokenIds: tokenIds.slice().sort(),
  });

  return listedTokensFamily(key);
};

export type { ListedTokensError };
