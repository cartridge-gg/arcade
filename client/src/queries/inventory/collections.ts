import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export enum CollectionType {
  ERC721 = "ERC-721",
  ERC1155 = "ERC-1155",
}

export interface Collection {
  address: string;
  name: string;
  type: CollectionType;
  imageUrl: string;
  totalCount: number;
  project: string;
}

export interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: {
        meta: {
          contractAddress: string;
          imagePath?: string;
          name?: string;
          assetCount: number;
          project: string;
        };
        assets: Array<{
          metadata?: string;
          tokenId: string;
        }>;
      };
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
}

async function fetchCollections(
  address: string,
  projects: string[],
  offset: number = 0
): Promise<CollectionsResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useCollectionsQuery
  throw new Error('TODO: implement me at inventory/collections.ts - Need to integrate Cartridge API for fetching ERC721 collections');
}

export function useCollectionsQuery(
  address: string,
  projects: string[],
  offset: number = 0
) {
  return useQuery({
    queryKey: queryKeys.inventory.collections(address, projects, offset),
    queryFn: () => fetchCollections(address, projects, offset),
    enabled: !!address && projects.length > 0 && BigInt(address) !== 0n,
    ...queryConfigs.inventory,
  });
}

// Infinite query for pagination
export function useInfiniteCollectionsQuery(
  address: string,
  projects: string[],
  limit: number = 100
) {
  return useInfiniteQuery({
    queryKey: queryKeys.inventory.collections(address, projects),
    queryFn: ({ pageParam = 0 }) => 
      fetchCollections(address, projects, pageParam),
    getNextPageParam: (lastPage, pages) => {
      const currentOffset = pages.length * limit;
      if (lastPage.collections?.edges.length === limit) {
        return currentOffset;
      }
      return undefined;
    },
    enabled: !!address && projects.length > 0 && BigInt(address) !== 0n,
    ...queryConfigs.inventory,
  });
}