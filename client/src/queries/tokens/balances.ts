import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";

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

export interface BalancesResponse {
  balances: {
    items: Array<{
      meta: {
        project: string;
      };
      balances: TokenBalance[];
    }>;
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

export function useBalancesQuery(
  address: string,
  projects?: string[],
  offset: number = 0,
) {
  const result = useQuery({
    queryKey: queryKeys.tokens.balances(address, projects, offset),
    queryFn: async () => {
      const data = await graphqlClient<BalancesResponse>(
        BALANCES_QUERY,
        {
          accountAddress: address,
          projects: projects || [],
          limit: 100,
          offset: offset,
        }
      );
      return data;
    },
    enabled: !!address && BigInt(address) !== 0n,
    ...queryConfigs.tokens,
  });

  // Return with proper typing
  return {
    ...result,
    data: result.data as BalancesResponse | undefined,
  };
}
