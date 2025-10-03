import { useState, useEffect } from "react";
import { fetchToriis } from "@cartridge/arcade";
import { CollectionType } from "@/context/collection";

/**
 * Hook for fetching token balances from multiple Torii endpoints
 * Handles pagination automatically to fetch all tokens for a given address
 */

const LIMIT = 1000;

/**
 * Helper function to process and merge token balances with metadata
 * @param projectTokens - Array of tokens with metadata from a single project
 * @param projectIndex - Index of the project in the projects array
 * @param projects - Array of project names
 * @returns Processed tokens mapped by checksum address
 */
function processTokensWithMetadata(
  projectTokens: TokenWithMetadata[],
  projectIndex: number,
  projects: string[],
): { [key: string]: FetchedToken } {
  const processedTokens: { [key: string]: FetchedToken } = {};

  projectTokens.forEach((token: TokenWithMetadata) => {
    if (token.contract_address) {
      // const checksumAddress = getChecksumAddress(token.contract_address);
      const checksumAddress = token.contract_address;
      const decimals = token.decimals || token.metadata?.decimals || 18;
      const balance = Number(token.balance) || 0;

      processedTokens[checksumAddress] = {
        balance: {
          amount: decimals > 0 ? balance / 10 ** decimals : balance,
          value: 0, // Will be calculated with price data
          change: 0, // Will be calculated with historical price data
        },
        metadata: {
          name: token.name || token.metadata?.name || "",
          symbol: token.symbol || token.metadata?.symbol || "",
          decimals: decimals,
          address: checksumAddress,
          project: projects[projectIndex] || undefined,
        },
      };
    }
  });

  return processedTokens;
}

/**
 * Helper function to extract unique contract addresses and token IDs from token balances
 * @param tokenBalances - Array of token balances
 * @returns Object containing unique contract addresses and token IDs
 */
function extractUniqueIdentifiers(tokenBalances: TokenBalance[]): {
  contractAddresses: string[];
  tokenIds: string[];
} {
  const contractAddresses = [
    ...new Set(
      tokenBalances
        .map((item: TokenBalance) => item.contract_address)
        .filter(Boolean),
    ),
  ];

  const tokenIds = [
    ...new Set(
      tokenBalances
        .map((item: TokenBalance) => item.token_id ?? "")
        .filter(Boolean),
    ),
  ];

  return { contractAddresses, tokenIds };
}

/**
 * Helper function to fetch and map token metadata for a batch of tokens
 * @param client - ToriiClient instance
 * @param contractAddresses - Unique contract addresses to fetch metadata for
 * @param tokenIds - Unique token IDs to fetch metadata for
 * @returns Map of token metadata keyed by contract_address-token_id
 */
async function fetchTokenMetadataMap(
  client: any,
  contractAddresses: string[],
  tokenIds: string[],
): Promise<Map<string, TokenMetadata>> {
  const tokenMetadataMap: Map<string, TokenMetadata> = new Map();

  try {
    const tokensResponse = await client.getTokens({
      contract_addresses: contractAddresses,
      attribute_filters: [],
      token_ids:
        tokenIds.length > 0 ? tokenIds.map((t) => t.replace("0x", "")) : [],
      pagination: {
        limit: LIMIT,
        cursor: undefined,
        direction: "Forward",
        order_by: [],
      },
    });

    // Create a map for quick lookup
    if (tokensResponse.items) {
      tokensResponse.items.forEach((token: TokenMetadata) => {
        const key = `${token.contract_address}${token.token_id ? `-${token.token_id}` : ""}`;
        tokenMetadataMap.set(key, token);
      });
    }
  } catch (error) {
    console.warn("Failed to fetch token metadata:", error);
  }

  return tokenMetadataMap;
}

/**
 * Helper function to merge token balances with their metadata
 * @param tokenBalances - Array of token balances
 * @param tokenMetadataMap - Map of token metadata
 * @returns Array of tokens with merged metadata
 */
function mergeTokensWithMetadata(
  tokenBalances: TokenBalance[],
  tokenMetadataMap: Map<string, TokenMetadata>,
): TokenWithMetadata[] {
  return tokenBalances.map((tokenBalance: TokenBalance) => {
    const key = `${tokenBalance.contract_address}${tokenBalance.token_id ? `-${tokenBalance.token_id}` : ""}`;
    const metadata = tokenMetadataMap.get(key);

    return {
      ...tokenBalance,
      name: metadata?.name || tokenBalance.name,
      symbol: metadata?.symbol || tokenBalance.symbol,
      decimals:
        metadata?.decimals !== undefined
          ? metadata.decimals
          : tokenBalance.decimals,
      metadata,
    } as TokenWithMetadata;
  });
}

export type TokenBalance = {
  balance: string;
  account_address: string;
  contract_address: string;
  token_id?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
};

export type TokenMetadata = {
  contract_address: string;
  token_id?: string;
  name: string;
  symbol: string;
  decimals: number;
  metadata?: string;
};

export type TokenWithMetadata = TokenBalance & {
  metadata?: TokenMetadata;
};

export type FetchedToken = {
  balance: {
    amount: number;
    value: number;
    change: number;
  };
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    project?: string;
  };
};

export type UseTokenFetcherResult = {
  tokens: { [key: string]: FetchedToken };
  status: "idle" | "loading" | "success" | "error";
  error: Error | null;
  refetch: () => void;
};

/**
 * Custom hook for fetching token balances from Torii endpoints
 *
 * @param projects - Array of project identifiers to fetch tokens from
 * @param address - User's wallet address to fetch balances for
 * @returns Object containing tokens, loading status, error state, and refetch function
 *
 * @example
 * ```ts
 * const { tokens, status, error, refetch } = useTokenFetcher(
 *   ['arcade-blobarena', 'arcade-main'],
 *   '0x123...'
 * );
 * ```
 */
export function useTokenFetcher(
  projects: string[],
  address: string | undefined,
): UseTokenFetcherResult {
  const [tokens, setTokens] = useState<{ [key: string]: FetchedToken }>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<Error | null>(null);

  const fetchTokens = async () => {
    if (!projects.length || !address) {
      setStatus("idle");
      setTokens({});
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const result = await fetchToriis(projects, {
        client: async ({ client }) => {
          let iterate = true;
          let next_cursor = undefined;
          const allTokensWithMetadata: TokenWithMetadata[] = [];

          while (iterate) {
            // Fetch token balances
            const response: any = await client.getTokenBalances({
              contract_addresses: [],
              account_addresses: [address],
              token_ids: [],
              pagination: {
                cursor: next_cursor,
                direction: "Forward",
                limit: LIMIT,
                order_by: [],
              },
            });

            // For each batch, fetch token metadata to enrich the balance data
            // This provides accurate name, symbol, and decimals for each token
            if (response.items && response.items.length > 0) {
              // Extract unique identifiers from this batch
              const { contractAddresses, tokenIds } = extractUniqueIdentifiers(
                response.items,
              );

              // Fetch metadata for all tokens in this batch
              const tokenMetadataMap = await fetchTokenMetadataMap(
                client,
                contractAddresses,
                tokenIds,
              );

              // Merge balance data with metadata
              const tokensWithMetadata = mergeTokensWithMetadata(
                response.items,
                tokenMetadataMap,
              );

              allTokensWithMetadata.push(...tokensWithMetadata);
            }

            if (!response.next_cursor) {
              iterate = false;
              break;
            }

            next_cursor = response.next_cursor;
          }

          return allTokensWithMetadata;
        },
      });

      // Process the fetched token balances with metadata
      let processedTokens: { [key: string]: FetchedToken } = {};

      if (result.data && Array.isArray(result.data)) {
        // Process tokens from all projects
        result.data.forEach((projectTokens, projectIndex) => {
          if (Array.isArray(projectTokens)) {
            const projectProcessedTokens = processTokensWithMetadata(
              projectTokens,
              projectIndex,
              projects,
            );
            // Merge tokens from this project into the main collection
            processedTokens = { ...processedTokens, ...projectProcessedTokens };
          }
        });
      }

      setTokens(processedTokens);
      setStatus("success");
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch tokens"),
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.join(","), address]); // Using join to create stable dependency

  const refetch = () => {
    fetchTokens();
  };

  return {
    tokens,
    status,
    error,
    refetch,
  };
}

export type Collection = {
  address: string;
  name: string;
  type: CollectionType;
  imageUrl: string;
  totalCount: number;
  project: string;
};

export type CollectibleMetadata = TokenMetadata & {
  image?: string;
};

export type UseCollectiblesResult = {
  collections: Collection[];
  status: "idle" | "loading" | "success" | "error";
  error: Error | null;
  refetch: () => void;
};

/**
 * Helper function to check if a token is an NFT (has token_id)
 * @param token - Token to check
 * @returns True if the token is an NFT
 */
function isNFT(token: TokenBalance | TokenWithMetadata): boolean {
  return (
    token.token_id !== null &&
    token.token_id !== undefined &&
    BigInt(token.balance) > 0
  );
}

/**
 * Helper function to aggregate NFTs by collection address
 * @param tokens - Array of NFT tokens
 * @returns Map of collection addresses to NFT arrays
 */
function aggregateNFTsByCollection(
  tokens: TokenWithMetadata[],
): Map<string, TokenWithMetadata[]> {
  const collectionMap = new Map<string, TokenWithMetadata[]>();

  tokens.forEach((token) => {
    if (isNFT(token) && token.contract_address) {
      // const address = getChecksumAddress(token.contract_address);
      const address = token.contract_address;
      const existing = collectionMap.get(address) || [];
      collectionMap.set(address, [...existing, token]);
    }
  });

  return collectionMap;
}

/**
 * Helper function to process NFT collections
 * @param collectionMap - Map of collection addresses to NFTs
 * @param project - Project name
 * @returns Array of Collection objects
 */
function processNFTCollections(
  collectionMap: Map<string, TokenWithMetadata[]>,
  project: string,
): Collection[] {
  const collections: Collection[] = [];

  collectionMap.forEach((nfts, address) => {
    // Get metadata from the first NFT in the collection
    const firstNFT = nfts[0];
    const metadata = firstNFT.metadata;

    let innerMeta = undefined;
    try {
      innerMeta = JSON.parse(metadata?.metadata as string);
    } catch (err) {}

    // Determine collection type (could be enhanced with actual logic)
    // For now, default to ERC721
    const collectionType = CollectionType.ERC721;

    collections.push({
      address: address,
      name: metadata?.name || firstNFT.name || "---",
      type: collectionType,
      imageUrl: getAssetImage(project, metadata, innerMeta, firstNFT),
      totalCount: nfts.length,
      project: project,
    });
  });

  return collections;
}

function getAssetImage(
  project: string,
  metadata: TokenMetadata | undefined,
  inner: CollectibleMetadata,
  firstNFT: TokenWithMetadata,
): string {
  const image = inner?.image;
  image?.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  return (
    image ??
    `https://api.cartridge.gg/x/${project}/torii/static/${metadata?.contract_address}/${firstNFT.token_id}/image`
  );
}

/**
 * Custom hook for fetching NFT collections from Torii endpoints
 *
 * @param projects - Array of project identifiers to fetch collections from
 * @param address - User's wallet address to fetch collections for
 * @returns Object containing collections, loading status, error state, and refetch function
 *
 * @example
 * ```ts
 * const { collections, status, error, refetch } = useCollectibles(
 *   ['arcade-blobarena', 'arcade-main'],
 *   '0x123...'
 * );
 * ```
 */
export function useCollectibles(
  projects: string[],
  address: string | undefined,
): UseCollectiblesResult {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<Error | null>(null);

  const fetchCollectibles = async () => {
    if (!projects.length || !address) {
      setStatus("idle");
      setCollections([]);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const result = await fetchToriis(projects, {
        client: async ({ client }) => {
          let iterate = true;
          let next_cursor = undefined;
          const allNFTs: TokenWithMetadata[] = [];

          while (iterate) {
            // Fetch token balances
            const response: any = await client.getTokenBalances({
              contract_addresses: [],
              account_addresses: [address],
              token_ids: [],
              pagination: {
                cursor: next_cursor,
                direction: "Forward",
                limit: LIMIT,
                order_by: [],
              },
            });

            // Filter for NFTs only
            const nftBalances = response.items.filter((item: TokenBalance) =>
              isNFT(item),
            );

            if (nftBalances.length > 0) {
              // Extract unique identifiers from NFT batch
              const { contractAddresses, tokenIds } =
                extractUniqueIdentifiers(nftBalances);

              // Fetch metadata for all NFTs in this batch
              const tokenMetadataMap = await fetchTokenMetadataMap(
                client,
                contractAddresses,
                tokenIds,
              );

              // Merge balance data with metadata
              const nftsWithMetadata = mergeTokensWithMetadata(
                nftBalances,
                tokenMetadataMap,
              );

              allNFTs.push(...nftsWithMetadata);
            }

            if (!response.next_cursor) {
              iterate = false;
              break;
            }

            next_cursor = response.next_cursor;
          }

          return allNFTs;
        },
      });

      // Process the fetched NFTs into collections
      const allCollections: Collection[] = [];

      if (result.data && Array.isArray(result.data)) {
        // Process NFTs from all projects
        result.data.forEach((projectNFTs, projectIndex) => {
          if (Array.isArray(projectNFTs)) {
            // Aggregate NFTs by collection
            const collectionMap = aggregateNFTsByCollection(projectNFTs);

            // Process into Collection objects
            const projectCollections = processNFTCollections(
              collectionMap,
              projects[projectIndex] || "",
            );

            allCollections.push(...projectCollections);
          }
        });
      }

      setCollections(allCollections);
      setStatus("success");
    } catch (err) {
      console.error("Error fetching collectibles:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch collectibles"),
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.join(","), address]); // Using join to create stable dependency

  const refetch = () => {
    fetchCollectibles();
  };

  return {
    collections,
    status,
    error,
    refetch,
  };
}
