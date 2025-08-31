import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/queries/graphql-client";
import { queryKeys } from "@/queries/keys";
import { CollectionType } from "@/context/collection";

export interface Collectible {
  address: string;
  tokenId: string;
  amount: string;
  name: string;
  imageUrl: string;
  metadata?: any;
  project: string;
}

export interface Collection {
  address: string;
  name: string;
  type: CollectionType;
  imageUrl: string;
  totalCount: number;
  project: string;
}

export interface Ownership {
  tokenId: string;
  contractAddress: string;
  owner: string;
  amount: string;
  project: string;
  metadata?: any;
}

interface CollectiblesResponse {
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

interface CollectionsResponse {
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

interface OwnershipsResponse {
  ownerships: {
    edges: Array<{
      node: Ownership;
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

const COLLECTIONS_QUERY = `
  query GetCollections($accountAddress: String!, $projects: [String!]) {
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

const OWNERSHIPS_QUERY = `
  query GetOwnerships($accountAddress: String!, $contractAddress: String!, $limit: Int) {
    ownerships(accountAddress: $accountAddress, contractAddress: $contractAddress, limit: $limit) {
      edges {
        node {
          tokenId
          contractAddress
          owner
          amount
          project
          metadata
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const collectiblesCollection = createCollection(
  queryCollectionOptions({
    queryKey: (address: string, projects: string[], offset: number = 0) => 
      queryKeys.inventory.collectibles(address, projects, offset),
    queryFn: async ({ queryKey }) => {
      const [, , address, projects] = queryKey as [unknown, unknown, string, string[]];
      const data = await graphqlClient<CollectiblesResponse>(
        COLLECTIBLES_QUERY,
        {
          accountAddress: address,
          projects: projects,
        }
      );
      
      const collectibles: Collectible[] = [];
      data.collectibles?.edges?.forEach((edge) => {
        const meta = edge.node.meta;
        edge.node.assets?.forEach((asset) => {
          collectibles.push({
            address: meta.contractAddress,
            tokenId: asset.tokenId,
            amount: asset.amount,
            name: meta.name || 'Unknown',
            imageUrl: meta.imagePath || '',
            metadata: asset.metadata ? JSON.parse(asset.metadata) : undefined,
            project: meta.project,
          });
        });
      });
      
      return collectibles;
    },
    queryClient: new QueryClient(),
    getKey: (item: Collectible) => `${item.project}-${item.address}-${item.tokenId}`,
    schema: {
      validate: (item: unknown): item is Collectible => {
        const c = item as Collectible;
        return typeof c.address === 'string' && 
               typeof c.tokenId === 'string' &&
               typeof c.amount === 'string' &&
               typeof c.project === 'string';
      }
    }
  })
);

export const collectionsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (address: string, projects?: string[]) => 
      queryKeys.inventory.collections(address, projects),
    queryFn: async ({ queryKey }) => {
      const [, , address, projects] = queryKey as [unknown, unknown, string, string[] | undefined];
      const data = await graphqlClient<CollectionsResponse>(
        COLLECTIONS_QUERY,
        {
          accountAddress: address,
          projects: projects || [],
        }
      );
      
      const collections: Collection[] = [];
      data.collections?.edges?.forEach((edge) => {
        const meta = edge.node.meta;
        const firstAsset = edge.node.assets?.[0];
        let metadata: { image?: string } = {};
        
        try {
          metadata = firstAsset?.metadata ? JSON.parse(firstAsset.metadata) : {};
        } catch (error) {
          console.warn('Failed to parse metadata:', error);
        }
        
        collections.push({
          address: meta.contractAddress,
          name: meta.name || 'Unknown',
          type: CollectionType.ERC721,
          imageUrl: meta.imagePath || metadata.image || '',
          totalCount: meta.assetCount,
          project: meta.project,
        });
      });
      
      return collections;
    },
    queryClient: new QueryClient(),
    getKey: (item: Collection) => `${item.project}-${item.address}`,
    schema: {
      validate: (item: unknown): item is Collection => {
        const c = item as Collection;
        return typeof c.address === 'string' && 
               typeof c.name === 'string' &&
               typeof c.project === 'string';
      }
    }
  })
);

export const ownershipsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (address: string, contractAddress: string, limit: number = 100) => 
      queryKeys.inventory.ownerships(address, contractAddress, limit),
    queryFn: async ({ queryKey }) => {
      const [, , address, contractAddress, limit] = queryKey as [unknown, unknown, string, string, number];
      const data = await graphqlClient<OwnershipsResponse>(
        OWNERSHIPS_QUERY,
        {
          accountAddress: address,
          contractAddress: contractAddress,
          limit: limit,
        }
      );
      
      const ownerships: Ownership[] = data.ownerships?.edges?.map(edge => edge.node) || [];
      
      return ownerships;
    },
    queryClient: new QueryClient(),
    getKey: (item: Ownership) => `${item.contractAddress}-${item.tokenId}-${item.owner}`,
    schema: {
      validate: (item: unknown): item is Ownership => {
        const o = item as Ownership;
        return typeof o.tokenId === 'string' && 
               typeof o.contractAddress === 'string' &&
               typeof o.owner === 'string' &&
               typeof o.amount === 'string';
      }
    }
  })
);