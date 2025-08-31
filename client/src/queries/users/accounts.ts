import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";

export interface Account {
  address: string;
  username: string;
  avatar?: string;
  createdAt?: string;
}

interface AccountNameResponse {
  account: {
    username: string;
  };
}

interface AccountNamesResponse {
  accounts: {
    edges: Array<{
      node: {
        username: string;
        controllers: {
          edges: Array<{
            node: {
              address: string;
            };
          }>;
        };
      };
    }>;
  };
}

const ACCOUNT_NAME_QUERY = `
  query GetAccountName($address: String!) {
    account(address: $address) {
      username
    }
  }
`;

const ACCOUNT_NAMES_QUERY = `
  query GetAccountNames($addresses: [String!]!) {
    accounts(addresses: $addresses) {
      edges {
        node {
          username
          controllers {
            edges {
              node {
                address
              }
            }
          }
        }
      }
    }
  }
`;

export function useAccountNameQuery(address: string) {
  const result = useQuery({
    queryKey: queryKeys.users.account(address),
    queryFn: async () => {
      const data = await graphqlClient<AccountNameResponse>(
        ACCOUNT_NAME_QUERY,
        { address }
      );
      return data;
    },
    enabled: !!address,
    ...queryConfigs.users,
  });

  // Return with proper typing
  return {
    ...result,
    data: result.data?.account?.username as string | undefined,
  };
}

export function useAccountNamesQuery(addresses: string[]) {
  const result = useQuery({
    queryKey: queryKeys.users.accounts(addresses),
    queryFn: async () => {
      const data = await graphqlClient<AccountNamesResponse>(
        ACCOUNT_NAMES_QUERY,
        { addresses }
      );
      return data;
    },
    enabled: addresses.length > 0,
    ...queryConfigs.users,
  });

  // Return with proper typing
  return {
    ...result,
    usernames:
      result.data?.accounts?.edges?.map((edge) => ({
        username: edge?.node?.username,
        address: edge?.node?.controllers?.edges?.[0]?.node?.address,
      })) ?? [],
  };
}
