import type {
  AttributeFilter,
  Token,
  TokenContract,
} from "@dojoengine/torii-wasm/types";
import { addAddressPadding, getChecksumAddress } from "starknet";
import type {
  AttributeFilterInput,
  AttributeFilterInputValue,
  NormalizedToken,
  ResolveTokenImage,
} from "./types";

export const DEFAULT_PROJECT_ID = "arcade-main";

const IMAGE_CANDIDATE_KEYS = [
  "image",
  "image_url",
  "imageUrl",
  "thumbnail",
  "thumbnail_url",
  "animation",
  "animation_url",
] as const;

export function ensureArray(
  value: AttributeFilterInputValue,
): Array<string | number | bigint> {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return [value];
  }

  if (value && Symbol.iterator in Object(value)) {
    return Array.from(value as Iterable<string | number | bigint>);
  }

  return [];
}

export function parseJsonSafe<T = any>(
  value: unknown,
  fallback: T | null = null,
): T | null {
  if (value == null) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch (_error) {
    return fallback;
  }
}

export function inferImageFromMetadata(metadata: any): string | undefined {
  if (!metadata) return undefined;

  for (const key of IMAGE_CANDIDATE_KEYS) {
    const candidate = metadata?.[key];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  if (metadata?.properties && typeof metadata.properties === "object") {
    for (const key of IMAGE_CANDIDATE_KEYS) {
      const candidate = metadata.properties?.[key];
      if (typeof candidate === "string" && candidate.length > 0) {
        return candidate;
      }
    }
  }

  return undefined;
}

export function normalizeAttributeFilters(
  filters?: AttributeFilterInput,
): AttributeFilter[] {
  if (!filters) return [];

  return Object.entries(filters).flatMap(([traitName, traitValues]) => {
    if (traitValues == null) return [];

    return ensureArray(traitValues).map((traitValue) => ({
      trait_name: traitName,
      trait_value: traitValue.toString(),
    }));
  });
}

export function resolveProjects(
  projects: string[] | undefined,
  defaultProject: string = DEFAULT_PROJECT_ID,
): string[] {
  if (!projects || projects.length === 0) {
    return [defaultProject];
  }

  return Array.from(new Set(projects.filter(Boolean)));
}

export function normalizeTokenIds(tokenIds?: string[]): string[] {
  if (!tokenIds || tokenIds.length === 0) return [];
  return tokenIds
    .map((id) => {
      try {
        return BigInt(id).toString();
      } catch (_error) {
        return id;
      }
    })
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

export async function normalizeTokens(
  tokens: Token[],
  projectId: string,
  options: {
    fetchImages: boolean;
    resolveTokenImage?: ResolveTokenImage;
  },
): Promise<NormalizedToken[]> {
  const { fetchImages, resolveTokenImage } = options;
  const resolver = resolveTokenImage ?? defaultResolveTokenImage;

  const resolved = await Promise.all(
    tokens.map(async (token) => {
      const checksumAddress = getChecksumAddress(token.contract_address);
      const metadata = parseJsonSafe(token.metadata, token.metadata);

      let image: string | undefined;
      if (fetchImages) {
        const maybeImage = await resolver(token, { projectId });
        if (typeof maybeImage === "string" && maybeImage.length > 0) {
          image = maybeImage;
        }

        if (!image) {
          const inferred = inferImageFromMetadata(metadata);
          if (inferred) {
            image = inferred;
          }
        }
      }

      return {
        ...token,
        contract_address: checksumAddress,
        metadata,
        image,
      };
    }),
  );

  return resolved;
}

async function fetchToriiStatic(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return url;
    }
  } catch (_error) {
    // Ignore network errors and fall back to metadata inference
  }
  return undefined;
}

export async function defaultResolveTokenImage(
  token: Token,
  context: { projectId: string },
): Promise<string | undefined> {
  const { projectId } = context;
  if (!token.contract_address || !token.token_id) {
    return undefined;
  }

  const url = `https://api.cartridge.gg/x/${projectId}/torii/static/${addAddressPadding(token.contract_address)}/${addAddressPadding(token.token_id)}/image`;
  return fetchToriiStatic(url);
}

export async function defaultResolveContractImage(
  contract: TokenContract,
  context: { projectId: string },
): Promise<string | undefined> {
  const { projectId } = context;
  if (!contract.contract_address) return undefined;

  const url = `https://api.cartridge.gg/x/${projectId}/torii/static/${addAddressPadding(contract.contract_address)}/image`;
  return fetchToriiStatic(url);
}
