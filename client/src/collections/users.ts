import { createCollection, inArray, useLiveQuery } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { graphqlClient } from "@/queries/graphql-client";
import { queryKeys } from "@/queries/keys";
import { getChecksumAddress } from "starknet";
import { queryClient } from "@/queries";

export type Account = {
  address: string;
  username: string;
  avatar?: string;
  createdAt?: string;
}

type AccountNamesResponse = {
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

const ACCOUNT_NAMES_QUERY = `
  query GetControllers {
    accounts {
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
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const data = await graphqlClient<AccountNamesResponse>(
        ACCOUNT_NAMES_QUERY,
      );

      const accounts: Account[] = [];
      data.accounts?.edges?.forEach((edge) => {
        const controllerAddress = edge.node.controllers?.edges?.[0]?.node?.address;
        if (controllerAddress) {
          accounts.push({
            address: getChecksumAddress(controllerAddress),
            username: edge.node.username,
          });
        }
      });

      return accounts;
    },
    queryClient,
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

export function useAccounts(addresses: string[] | undefined) {
  const { data: accounts } = useLiveQuery(q => {
    let query = q
      .from({ accounts: accountsCollection })

    if (addresses && addresses.length > 0) {
      query = query.where(({ accounts }) => inArray(accounts.address, addresses))
    }

    return query.select(({ accounts }) => ({ ...accounts }));
  });

  return accounts;
}

