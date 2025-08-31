import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";

export interface Credits {
  balance: string;
  formattedBalance: string;
  decimals: number;
  symbol: string;
}

const CREDIT_BALANCE_QUERY = `
  query GetCreditBalance($username: String!) {
    creditBalance(username: $username) {
      balance
    }
  }
`;

async function fetchCredits(address: string): Promise<Credits> {
  // TODO: Replace with actual Cartridge Credits API call
  // This should fetch Cartridge Credits balance
  throw new Error(
    "TODO: implement me at tokens/credits.ts - Need to integrate Cartridge Credits API",
  );
}

export function useCreditsQuery(address: string) {
  return useQuery({
    queryKey: queryKeys.tokens.credits(address),
    queryFn: () => fetchCredits(address),
    enabled: !!address,
    ...queryConfigs.tokens,
  });
}

/**
 * Hook to fetch user's credit balance
 * @param username - The user's username
 * @param interval - Refresh interval in milliseconds
 * @returns Credit balance data
 */
export function useCreditBalance({
  username,
  interval = 30000,
}: {
  username: string;
  interval?: number;
}) {
  const result = useQuery({
    queryKey: ["creditBalance", username],
    queryFn: async () => {
      if (!username) {
        return { balance: { value: 0 } };
      }
      
      const data = await graphqlClient<{ creditBalance: { balance: number } }>(
        CREDIT_BALANCE_QUERY,
        { username }
      );
      
      return {
        balance: {
          value: data.creditBalance?.balance || 0,
        },
      };
    },
    enabled: !!username,
    refetchInterval: interval,
    ...queryConfigs.tokens,
  });

  return {
    balance: {
      value: result.data?.balance?.value || 0,
    },
    isLoading: result.isLoading,
    error: result.error,
  };
}

// Mutation for purchasing credits
export function usePurchaseCreditsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      address,
      amount,
    }: {
      address: string;
      amount: string;
    }) => {
      // TODO: Implement credits purchase
      throw new Error(
        "TODO: implement me at tokens/credits.ts - Need to implement credits purchase",
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate credits query to refetch balance
      queryClient.invalidateQueries({
        queryKey: queryKeys.tokens.credits(variables.address),
      });
    },
  });
}
