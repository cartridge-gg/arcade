import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/queries/graphql-client";
import { queryKeys } from "@/queries/keys";

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
  query GetControllers($addresses: [String!]!) {
    accounts(where: {hasControllersWith: {addressIn: $addresses}}) {
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

export const accountsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (addresses: string[]) => 
      queryKeys.users.accounts(addresses),
    queryFn: async ({ queryKey }) => {
      const addresses = queryKey[queryKey.length - 1] as string[];
      
      if (addresses.length === 1) {
        const data = await graphqlClient<AccountNameResponse>(
          ACCOUNT_NAME_QUERY,
          { address: addresses[0] }
        );
        
        return [{
          address: addresses[0],
          username: data.account?.username || 'Unknown',
        }];
      } else {
        const data = await graphqlClient<AccountNamesResponse>(
          ACCOUNT_NAMES_QUERY,
          { addresses }
        );
        
        const accounts: Account[] = [];
        data.accounts?.edges?.forEach((edge) => {
          const controllerAddress = edge.node.controllers?.edges?.[0]?.node?.address;
          if (controllerAddress) {
            accounts.push({
              address: controllerAddress,
              username: edge.node.username,
            });
          }
        });
        
        return accounts;
      }
    },
    queryClient: new QueryClient(),
    getKey: (item: Account) => item.address,
    schema: {
      validate: (item: unknown): item is Account => {
        const a = item as Account;
        return typeof a.address === 'string' && 
               typeof a.username === 'string';
      }
    }
  })
);

export const accountByAddressCollection = createCollection(
  queryCollectionOptions({
    queryKey: (address: string) => 
      queryKeys.users.account(address),
    queryFn: async ({ queryKey }) => {
      const address = queryKey[queryKey.length - 1] as string;
      const data = await graphqlClient<AccountNameResponse>(
        ACCOUNT_NAME_QUERY,
        { address }
      );
      
      return [{
        address: address,
        username: data.account?.username || 'Unknown',
      }];
    },
    queryClient: new QueryClient(),
    getKey: (item: Account) => item.address,
    schema: {
      validate: (item: unknown): item is Account => {
        const a = item as Account;
        return typeof a.address === 'string' && 
               typeof a.username === 'string';
      }
    }
  })
);