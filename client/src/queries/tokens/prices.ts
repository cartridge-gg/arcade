import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";

export interface TokenPrice {
  token: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
}

export interface PricesResponse {
  prices: Record<string, TokenPrice>;
  timestamp: number;
}

async function fetchPrices(tokens: string[]): Promise<PricesResponse> {
  // TODO: Replace with actual price API call
  // This could use CoinGecko, DeFiLlama, or another price oracle
  throw new Error(
    "TODO: implement me at tokens/prices.ts - Need to integrate price oracle API for USD values",
  );
}

export function usePricesQuery(tokens: string[]) {
  return useQuery({
    queryKey: queryKeys.tokens.prices(tokens),
    queryFn: () => fetchPrices(tokens),
    enabled: tokens.length > 0,
    staleTime: 1000 * 60, // 1 minute for price data
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}

// Single token price query
export function useTokenPriceQuery(token: string) {
  return useQuery({
    queryKey: queryKeys.tokens.prices([token]),
    queryFn: async () => {
      const data = await fetchPrices([token]);
      return data.prices[token];
    },
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute for price data
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}
