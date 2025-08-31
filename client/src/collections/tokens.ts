import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/queries/graphql-client";
import { queryKeys } from "@/queries/keys";

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
  project?: string;
  logoUrl?: string;
}

export interface Credit {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  project?: string;
}

interface BalancesResponse {
  balances: {
    items: Array<{
      meta: {
        project: string;
      };
      balances: TokenBalance[];
    }>;
  };
}

interface CreditsResponse {
  credits: {
    edges: Array<{
      node: Credit;
    }>;
    pageInfo?: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
}

const BALANCES_QUERY = `
  query GetBalances($accountAddress: String!, $projects: [String!], $limit: Int, $offset: Int) {
    balances(accountAddress: $accountAddress, projects: $projects, limit: $limit, offset: $offset) {
      items {
        meta {
          project
        }
        balances {
          contractAddress
          symbol
          name
          decimals
          balance
          formattedBalance
          project
          logoUrl
        }
      }
    }
  }
`;

const CREDITS_QUERY = `
  query GetCredits($userId: String!, $projects: [String!]) {
    credits(userId: $userId, projects: $projects) {
      edges {
        node {
          id
          userId
          amount
          currency
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const balancesCollection = createCollection(
  queryCollectionOptions({
    queryKey: (address: string, projects?: string[], offset: number = 0) => 
      queryKeys.tokens.balances(address, projects, offset),
    queryFn: async ({ queryKey }) => {
      const [, , address, projects, offset] = queryKey as [unknown, unknown, string, string[] | undefined, number];
      const data = await graphqlClient<BalancesResponse>(
        BALANCES_QUERY,
        {
          accountAddress: address,
          projects: projects || [],
          limit: 100,
          offset: offset,
        }
      );
      
      const balances: TokenBalance[] = [];
      data.balances?.items?.forEach((item) => {
        item.balances?.forEach((balance) => {
          balances.push({
            ...balance,
            project: balance.project || item.meta.project,
          });
        });
      });
      
      return balances;
    },
    queryClient: new QueryClient(),
    getKey: (item: TokenBalance) => `${item.project}-${item.contractAddress}-${item.symbol}`,
    schema: {
      validate: (item: unknown): item is TokenBalance => {
        const b = item as TokenBalance;
        return typeof b.contractAddress === 'string' && 
               typeof b.symbol === 'string' &&
               typeof b.name === 'string' &&
               typeof b.balance === 'string' &&
               typeof b.decimals === 'number';
      }
    }
  })
);

export const creditsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (userId: string, projects?: string[]) => 
      queryKeys.tokens.credits(userId, projects),
    queryFn: async ({ queryKey }) => {
      const [, , userId, projects] = queryKey as [unknown, unknown, string, string[] | undefined];
      const data = await graphqlClient<CreditsResponse>(
        CREDITS_QUERY,
        {
          userId: userId,
          projects: projects || [],
        }
      );
      
      const credits: Credit[] = data.credits?.edges?.map(edge => ({
        ...edge.node,
        project: projects?.[0] || 'default',
      })) || [];
      
      return credits;
    },
    queryClient: new QueryClient(),
    getKey: (item: Credit) => item.id || `${item.userId}-${item.createdAt}`,
    schema: {
      validate: (item: unknown): item is Credit => {
        const c = item as Credit;
        return typeof c.userId === 'string' && 
               typeof c.amount === 'string' &&
               typeof c.currency === 'string';
      }
    }
  })
);