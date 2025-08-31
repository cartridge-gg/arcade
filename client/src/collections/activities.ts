import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/queries/graphql-client";
import { queryKeys } from "@/queries/keys";

export interface ActivityProject {
  project: string;
  address: string;
  limit?: number;
}

export interface Activity {
  transactionHash: string;
  executedAt: string;
  eventId: string;
  type: string;
  data: any;
  metadata?: any;
  project?: string;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: string;
  tokenAddress: string;
  tokenId?: string;
  timestamp: string;
  transactionHash: string;
  project?: string;
}

interface ActivitiesResponse {
  activities: {
    items: {
      meta: { project: string };
      activities: Activity[];
    }[];
  };
}

interface TransfersResponse {
  transfers: {
    edges: Array<{
      node: Transfer;
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
}

const ACTIVITIES_QUERY = `
  query GetActivities($projects: [ActivityProject!]!) {
    activities(projects: $projects) {
      items {
        meta {
          project
        }
        activities {
          transactionHash
          executedAt
          eventId
          type
          data
          metadata
        }
      }
    }
  }
`;

const TRANSFERS_QUERY = `
  query GetTransfers($accountAddress: String!, $projects: [String!], $limit: Int, $offset: Int) {
    transfers(accountAddress: $accountAddress, projects: $projects, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          from
          to
          amount
          tokenAddress
          tokenId
          timestamp
          transactionHash
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const transactionsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (projects: ActivityProject[]) => 
      queryKeys.activities.transactions(projects),
    queryFn: async ({ queryKey }) => {
      const projects = queryKey[queryKey.length - 1] as ActivityProject[];
      const data = await graphqlClient<ActivitiesResponse>(
        ACTIVITIES_QUERY,
        { projects }
      );
      
      const activities: Activity[] = [];
      data.activities?.items?.forEach((item) => {
        item.activities?.forEach((activity) => {
          activities.push({
            ...activity,
            project: item.meta.project,
          });
        });
      });
      
      return activities;
    },
    queryClient: new QueryClient(),
    getKey: (item: Activity) => `${item.project}-${item.transactionHash}-${item.eventId}`,
    schema: {
      validate: (item: unknown): item is Activity => {
        const a = item as Activity;
        return typeof a.transactionHash === 'string' && 
               typeof a.executedAt === 'string' &&
               typeof a.eventId === 'string' &&
               typeof a.type === 'string';
      }
    }
  })
);

export const transfersCollection = createCollection(
  queryCollectionOptions({
    queryKey: (address: string, projects?: string[], offset: number = 0) => 
      queryKeys.activities.transfers(address, projects, offset),
    queryFn: async ({ queryKey }) => {
      const [, , address, projects, offset] = queryKey as [unknown, unknown, string, string[], number];
      const data = await graphqlClient<TransfersResponse>(
        TRANSFERS_QUERY,
        {
          accountAddress: address,
          projects: projects || [],
          limit: 100,
          offset: offset || 0,
        }
      );
      
      const transfers: Transfer[] = data.transfers?.edges?.map(edge => ({
        ...edge.node,
        project: projects?.[0] || 'default',
      })) || [];
      
      return transfers;
    },
    queryClient: new QueryClient(),
    getKey: (item: Transfer) => item.id || `${item.transactionHash}-${item.tokenAddress}-${item.timestamp}`,
    schema: {
      validate: (item: unknown): item is Transfer => {
        const t = item as Transfer;
        return typeof t.from === 'string' && 
               typeof t.to === 'string' &&
               typeof t.amount === 'string' &&
               typeof t.tokenAddress === 'string';
      }
    }
  })
);