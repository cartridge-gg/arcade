import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

export interface Collectible {
  address: string;
  tokenId: string;
  amount: string;
  name: string;
  imageUrl: string;
  metadata?: any;
  project: string;
}

export interface CollectiblesResponse {
  collectibles: {
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
          tokenId: string;
          amount: string;
          metadata?: string;
        }>;
      };
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
}

async function fetchCollectibles(
  address: string,
  projects: string[],
  offset: number = 0
): Promise<CollectiblesResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useCollectiblesQuery
  throw new Error('TODO: implement me at inventory/collectibles.ts - Need to integrate Cartridge API for fetching ERC1155 collectibles');
}

export function useCollectiblesQuery(
  address: string,
  projects: string[],
  offset: number = 0
) {
  return useQuery({
    queryKey: queryKeys.inventory.collectibles(address, projects, offset),
    queryFn: () => fetchCollectibles(address, projects, offset),
    enabled: !!address && projects.length > 0 && BigInt(address) !== 0n,
    ...queryConfigs.inventory,
  });
}

// Infinite query for pagination
export function useInfiniteCollectiblesQuery(
  address: string,
  projects: string[],
  limit: number = 100
) {
  return useInfiniteQuery({
    queryKey: queryKeys.inventory.collectibles(address, projects),
    queryFn: ({ pageParam = 0 }) => 
      fetchCollectibles(address, projects, pageParam),
    getNextPageParam: (lastPage, pages) => {
      const currentOffset = pages.length * limit;
      if (lastPage.collectibles?.edges.length === limit) {
        return currentOffset;
      }
      return undefined;
    },
    enabled: !!address && projects.length > 0 && BigInt(address) !== 0n,
    ...queryConfigs.inventory,
  });
}