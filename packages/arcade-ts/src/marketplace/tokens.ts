import { addAddressPadding } from "starknet";
import type {
  AttributeFilter,
  ToriiClient,
  Token as ToriiToken,
} from "@dojoengine/torii-wasm/types";
import {
  fetchToriis,
  type ClientCallbackParams,
} from "../modules/torii-fetcher";
import type {
  CollectionTokensError,
  CollectionTokensPage,
  FetchCollectionTokensOptions,
  FetchCollectionTokensResult,
  FetchTokenBalancesOptions,
  FetchTokenBalancesResult,
  TokenBalancesError,
  TokenBalancesPage,
} from "./types";
import {
  canonicalizeTokenId,
  DEFAULT_PROJECT_ID,
  normalizeAttributeFilters,
  normalizeTokens,
  resolveProjects,
} from "./utils";

type TokenPage = Awaited<ReturnType<ToriiClient["getTokens"]>>;

const DEFAULT_LIMIT = 100;

const normalizeTokenIdsForQuery = (tokenIds?: string[]): string[] => {
  if (!tokenIds || tokenIds.length === 0) return [];

  const normalized = tokenIds
    .map((tokenId) => canonicalizeTokenId(tokenId))
    .flatMap((tokenId) => {
      if (!tokenId) return [];

      try {
        const hexTokenId = `0x${BigInt(tokenId).toString(16)}`;
        return [addAddressPadding(hexTokenId).slice(2)];
      } catch (_error) {
        try {
          const padded = addAddressPadding(tokenId);
          return [padded.startsWith("0x") ? padded.slice(2) : padded];
        } catch (_paddingError) {
          const fallback = tokenId.startsWith("0x")
            ? tokenId.slice(2)
            : tokenId;
          return fallback.length > 0 ? [fallback] : [];
        }
      }
    });

  return Array.from(new Set(normalized));
};

export async function fetchCollectionTokens(
  options: FetchCollectionTokensOptions,
): Promise<FetchCollectionTokensResult> {
  const {
    address,
    project,
    cursor,
    attributeFilters,
    tokenIds,
    limit = DEFAULT_LIMIT,
    includeMetadata = true,
    fetchImages = false,
    resolveTokenImage,
  } = options;

  const projectIds = resolveProjects(
    project ? [project] : undefined,
    options.defaultProjectId ?? DEFAULT_PROJECT_ID,
  );
  const projectId = projectIds[0];
  const filters: AttributeFilter[] =
    normalizeAttributeFilters(attributeFilters);
  const normalizedTokenIds = normalizeTokenIdsForQuery(tokenIds);

  try {
    const response = await fetchToriis([projectId], {
      client: async ({ client }: ClientCallbackParams) => {
        return client.getTokens({
          contract_addresses: [addAddressPadding(address)],
          token_ids: normalizedTokenIds,
          attribute_filters: filters,
          pagination: {
            limit,
            cursor: cursor ?? undefined,
            direction: "Forward",
            order_by: [],
          },
        });
      },
    });

    if (response.errors && response.errors.length > 0) {
      const err = response.errors[0];
      const collectionError: CollectionTokensError = {
        error: err,
      };
      return {
        page: null,
        error: collectionError,
      };
    }

    const pages = response.data as TokenPage[];
    let nextCursor: string | null = null;
    const normalizedTokens: Array<ToriiToken> = [];

    for (const page of pages) {
      nextCursor = page.next_cursor ?? null;
      if (!page.items.length) continue;
      normalizedTokens.push(...page.items);
    }

    const enriched = await normalizeTokens(normalizedTokens, projectId, {
      fetchImages,
      resolveTokenImage,
    });

    const pageTokens = includeMetadata
      ? enriched
      : enriched.map((token) => ({
          ...token,
          metadata: undefined,
        }));

    const page: CollectionTokensPage = {
      tokens: pageTokens,
      nextCursor,
    };

    return {
      page,
      error: null,
    };
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            typeof error === "string"
              ? error
              : "Failed to fetch collection tokens",
          );
    const collectionError: CollectionTokensError = {
      error: err,
    };
    return {
      page: null,
      error: collectionError,
    };
  }
}

type TokenBalancePage = Awaited<ReturnType<ToriiClient["getTokenBalances"]>>;

export async function fetchTokenBalances(
  options: FetchTokenBalancesOptions,
): Promise<FetchTokenBalancesResult> {
  const {
    project,
    contractAddresses = [],
    accountAddresses = [],
    tokenIds = [],
    cursor,
    limit = DEFAULT_LIMIT,
  } = options;

  const projectIds = resolveProjects(
    project ? [project] : undefined,
    options.defaultProjectId ?? DEFAULT_PROJECT_ID,
  );
  const projectId = projectIds[0];

  const normalizedContractAddresses = contractAddresses.map(addAddressPadding);
  const normalizedAccountAddresses = accountAddresses.map(addAddressPadding);
  const normalizedTokenIds = normalizeTokenIdsForQuery(tokenIds);

  try {
    const response = await fetchToriis([projectId], {
      client: async ({ client }: ClientCallbackParams) => {
        return client.getTokenBalances({
          contract_addresses: normalizedContractAddresses,
          account_addresses: normalizedAccountAddresses,
          token_ids: normalizedTokenIds,
          pagination: {
            limit,
            cursor: cursor ?? undefined,
            direction: "Forward",
            order_by: [],
          },
        });
      },
    });

    if (response.errors && response.errors.length > 0) {
      const err = response.errors[0];
      const balancesError: TokenBalancesError = {
        error: err,
      };
      return {
        page: null,
        error: balancesError,
      };
    }

    const pages = response.data as TokenBalancePage[];
    let nextCursor: string | null = null;
    const balances: TokenBalancePage["items"] = [];

    for (const page of pages) {
      nextCursor = page.next_cursor ?? null;
      if (!page.items.length) continue;
      balances.push(...page.items);
    }

    const page: TokenBalancesPage = {
      balances,
      nextCursor,
    };

    return {
      page,
      error: null,
    };
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            typeof error === "string"
              ? error
              : "Failed to fetch token balances",
          );
    const balancesError: TokenBalancesError = {
      error: err,
    };
    return {
      page: null,
      error: balancesError,
    };
  }
}
