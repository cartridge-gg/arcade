import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';
import { useCollectiblesQuery as useCartridgeCollectiblesQuery } from '@cartridge/ui/utils/api/cartridge';

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

export function useCollectiblesQuery(
  address: string,
  projects: string[],
  offset: number = 0
) {
  // Use the Cartridge API hook directly
  const result = useCartridgeCollectiblesQuery(
    {
      accountAddress: address,
      projects: projects,
    },
    {
      queryKey: queryKeys.inventory.collectibles(address, projects, offset),
      enabled: !!address && projects.length > 0 && BigInt(address) !== 0n,
      ...queryConfigs.inventory,
    }
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data as CollectiblesResponse | undefined,
  };
}

