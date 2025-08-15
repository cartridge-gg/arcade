import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { queryConfigs } from '../queryClient';

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

async function fetchBalances(
  address: string,
  projects?: string[],
  offset: number = 0
): Promise<BalancesResponse> {
  // TODO: Replace with actual Cartridge API call
  // This should use @cartridge/ui/utils/api/cartridge useBalancesQuery
  throw new Error('TODO: implement me at tokens/balances.ts - Need to integrate Cartridge API for fetching token balances');
}

export function useBalancesQuery(
  address: string,
  projects?: string[],
  offset: number = 0
) {
  return useQuery({
    queryKey: queryKeys.tokens.balances(address, projects, offset),
    queryFn: () => fetchBalances(address, projects, offset),
    enabled: !!address && BigInt(address) !== 0n,
    ...queryConfigs.tokens,
  });
}

// Query for specific ERC20 balance via RPC
export function useERC20BalanceQuery(address: string, tokenAddress: string) {
  return useQuery({
    queryKey: queryKeys.tokens.erc20(address, tokenAddress),
    queryFn: async () => {
      // TODO: Direct RPC call to get ERC20 balance
      // This should use starknet.js to call balanceOf
      throw new Error('TODO: implement me at tokens/balances.ts - Need to implement direct RPC call for ERC20 balance');
    },
    enabled: !!address && !!tokenAddress,
    ...queryConfigs.tokens,
  });
}