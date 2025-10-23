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
} from "./types";
import {
  DEFAULT_PROJECT_ID,
  normalizeAttributeFilters,
  normalizeTokens,
  resolveProjects,
} from "./utils";

type TokenPage = Awaited<ReturnType<ToriiClient["getTokens"]>>;

const DEFAULT_LIMIT = 100;

const normalizeTokenIdsForQuery = (tokenIds?: string[]): string[] => {
  if (!tokenIds || tokenIds.length === 0) return [];
  return tokenIds
    .map((id) => (id.startsWith("0x") ? id.slice(2) : id))
    .filter((id) => id.length > 0);
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

    const page: CollectionTokensPage = {
      tokens: enriched,
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
