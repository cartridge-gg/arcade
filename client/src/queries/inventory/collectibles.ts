import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";

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

const COLLECTIBLES_QUERY = `
  query GetCollectibles($accountAddress: String!, $projects: [String!]!) {
    collectibles(accountAddress: $accountAddress, projects: $projects) {
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
            tokenId
            amount
            metadata
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

export function useCollectiblesQuery(
  address: string,
  projects: string[],
  offset: number = 0,
) {
  const result = useQuery({
    queryKey: queryKeys.inventory.collectibles(address, projects, offset),
    queryFn: async () => {
      const data = await graphqlClient<CollectiblesResponse>(
        COLLECTIBLES_QUERY,
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
    data: result.data as CollectiblesResponse | undefined,
  };
}
