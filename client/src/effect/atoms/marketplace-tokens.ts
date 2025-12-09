import { Atom } from "@effect-atom/atom-react";
import { Effect, Stream, Data, Option, Layer } from "effect";
import { fetchCollectionTokens } from "@cartridge/arcade/marketplace";
import { addAddressPadding } from "starknet";
import type { Token } from "@dojoengine/torii-wasm";

const LIMIT = 100;

type AtomKey = {
  project: string;
  address: string;
  attributeFilters?: Record<string, string[]>;
  tokenIds?: string[];
};

class MarketplaceTokensError extends Data.TaggedError(
  "MarketplaceTokensError",
)<{
  message: string;
}> {}

const fetchTokensStream = (key: AtomKey) => {
  const normalizedAddress = addAddressPadding(key.address);

  return Stream.paginateEffect(undefined as string | undefined, (cursor) =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () =>
          fetchCollectionTokens({
            address: normalizedAddress,
            project: key.project,
            cursor: cursor ?? undefined,
            limit: LIMIT,
            attributeFilters: key.attributeFilters,
            tokenIds: key.tokenIds,
            fetchImages: true,
          }),
        catch: (error) =>
          new MarketplaceTokensError({
            message: error instanceof Error ? error.message : String(error),
          }),
      });

      if (result.error) {
        yield* Effect.fail(
          new MarketplaceTokensError({
            message: result.error.error?.message ?? "Failed to fetch tokens",
          }),
        );
      }

      const tokens = (result.page?.tokens ?? []) as Token[];
      const nextCursor = result.page?.nextCursor;

      return [
        tokens,
        nextCursor ? Option.some(nextCursor) : Option.none(),
      ] as const;
    }),
  );
};

const marketplaceRuntime = Atom.runtime(Layer.empty);

const marketplaceTokensFamily = Atom.family((key: string) => {
  const parsed: AtomKey = JSON.parse(key);
  return marketplaceRuntime
    .pull(fetchTokensStream(parsed), { initialValue: [] })
    .pipe(Atom.keepAlive);
});

export const marketplaceTokensAtom = (
  project: string,
  address: string,
  attributeFilters?: { [name: string]: Set<string> },
  tokenIds?: string[],
) => {
  if (!address) {
    return marketplaceTokensFamily(
      JSON.stringify({
        project,
        address: "",
        attributeFilters: undefined,
        tokenIds: undefined,
      }),
    );
  }

  const serializedFilters = attributeFilters
    ? Object.fromEntries(
        Object.entries(attributeFilters).map(([k, v]) => [
          k,
          Array.from(v).sort(),
        ]),
      )
    : undefined;

  const key = JSON.stringify({
    project,
    address: addAddressPadding(address),
    attributeFilters: serializedFilters,
    tokenIds: tokenIds?.slice().sort(),
  });

  return marketplaceTokensFamily(key);
};

export type { MarketplaceTokensError };
