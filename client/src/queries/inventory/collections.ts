import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';
import { useCollectionsQuery as useCartridgeCollectionsQuery } from '@cartridge/ui/utils/api/cartridge';

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

export function useCollectionsQuery(
  address: string,
  projects: string[],
  offset: number = 0
) {
  // Use the Cartridge API hook directly
  const result = useCartridgeCollectionsQuery(
    {
      accountAddress: address,
      projects: projects,
    },
    {
      queryKey: queryKeys.inventory.collections(address, projects, offset),
      enabled: !!address && projects.length > 0 && BigInt(address) !== 0n,
      ...queryConfigs.inventory,
    }
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data as CollectionsResponse | undefined,
  };
}

