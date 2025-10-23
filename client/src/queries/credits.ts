import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { graphqlClient } from "./graphql-client";

type CreditsBalanceProps = {
  username: string | undefined;
};
const CREDITS_BALANCE_QUERY = `query Credit($username: String!) {
  account(username: $username) {
    credits {
      amount
      decimals
    }
  }
}`;

export function useCreditsBalance({ username }: CreditsBalanceProps) {
  return useQuery({
    queryKey: queryKeys.prices.credits(username ?? ""),
    enabled: username !== undefined,
    queryFn: async () => {
      const data = await graphqlClient(CREDITS_BALANCE_QUERY, {
        username,
      });
      return data.account.credits;
    },
  });
}
