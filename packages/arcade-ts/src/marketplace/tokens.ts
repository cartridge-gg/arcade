import { getChecksumAddress } from "starknet";
import type {
  AttributeFilter,
  ToriiClient,
  Token as ToriiToken,
} from "@dojoengine/torii-wasm";
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
    projects,
    cursors,
    attributeFilters,
    tokenIds,
    limit = DEFAULT_LIMIT,
    fetchImages = true,
    resolveTokenImage,
  } = options;

  const checksumAddress = getChecksumAddress(address);
  const projectIds = resolveProjects(
    projects,
    options.defaultProjectId ?? DEFAULT_PROJECT_ID,
  );
  const filters: AttributeFilter[] =
    normalizeAttributeFilters(attributeFilters);
  const normalizedTokenIds = normalizeTokenIdsForQuery(tokenIds);

  const results = await Promise.allSettled(
    projectIds.map(async (projectId) => {
      try {
        const response = await fetchToriis([projectId], {
          client: async ({ client }: ClientCallbackParams) => {
            return client.getTokens({
              contract_addresses: [checksumAddress],
              token_ids: normalizedTokenIds,
              attribute_filters: filters,
              pagination: {
                limit,
                cursor: cursors?.[projectId] ?? undefined,
                direction: "Forward",
                order_by: [],
              },
            });
          },
        });

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

        return {
          projectId,
          tokens: enriched,
          nextCursor,
        } satisfies CollectionTokensPage;
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error(
                typeof error === "string"
                  ? error
                  : "Failed to fetch collection tokens",
              );
        throw { projectId, error: err } satisfies CollectionTokensError;
      }
    }),
  );

  const pages: CollectionTokensPage[] = [];
  const errors: CollectionTokensError[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      pages.push(result.value);
    } else {
      errors.push(result.reason as CollectionTokensError);
    }
  }

  return { pages, errors };
}
