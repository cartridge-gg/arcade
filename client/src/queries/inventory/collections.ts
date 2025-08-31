import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";

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

const COLLECTIONS_QUERY = `
  query GetCollections($accountAddress: String!, $projects: [String!]!) {
    collections(accountAddress: $accountAddress, projects: $projects) {
      edges {
        node {
          meta {
            contractAddress
            imagePath
            name
            assetCount
            project
          }
          assets {
            metadata
            tokenId
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export function useCollectionsQuery(
  address: string,
  projects: string[],
  offset: number = 0,
) {
  const result = useQuery({
    queryKey: queryKeys.inventory.collections(address, projects, offset),
    queryFn: async () => {
      const data = await graphqlClient<CollectionsResponse>(
        COLLECTIONS_QUERY,
        {
          accountAddress: address,
          projects: projects,
        }
      );
      return data;
    },
    enabled: !!address && projects.length > 0 && BigInt(address) !== 0n,
    ...queryConfigs.inventory,
  });

  // Return with proper typing
  return {
    ...result,
    data: result.data as CollectionsResponse | undefined,
  };
}
