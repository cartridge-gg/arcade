import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { useBalancesQuery as useCartridgeBalancesQuery } from "@cartridge/ui/utils/api/cartridge";

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

export function useBalancesQuery(
  address: string,
  projects?: string[],
  offset: number = 0,
) {
  // Use the Cartridge API hook directly
  const result = useCartridgeBalancesQuery(
    {
      accountAddress: address,
      projects: projects || [],
      limit: 100,
      offset: offset,
    },
    {
      queryKey: queryKeys.tokens.balances(address, projects, offset),
      enabled: !!address && BigInt(address) !== 0n,
      ...queryConfigs.tokens,
    },
  );

  // Return with proper typing
  return {
    ...result,
    data: result.data as BalancesResponse | undefined,
  };
}
