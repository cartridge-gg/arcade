import { createCollection, eq, useLiveQuery } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { graphqlClient } from "@/queries/graphql-client";
import { queryKeys } from "@/queries/keys";
import { getChecksumAddress } from "starknet";
import { queryClient } from "@/queries";
import { useMemo } from "react";

export type Account = {
  address: string;
  username: string;
  avatar?: string;
  createdAt?: string;
};

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
};

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

export const accountsQueryOptions = {
  queryKey: queryKeys.users.accounts(),
  queryFn: async () => {
    const data = await graphqlClient<AccountNamesResponse>(ACCOUNT_NAMES_QUERY);

    const accounts: Account[] = [];
    for (const edge of data.accounts.edges) {
      const controllerAddress =
        edge.node.controllers?.edges?.[0]?.node?.address;
      if (controllerAddress) {
        accounts.push({
          address: getChecksumAddress(controllerAddress),
          username: edge.node.username,
        });
      }
    }

    return accounts;
  },
};

export const accountsCollection = createCollection(
  queryCollectionOptions({
    ...accountsQueryOptions,
    queryClient,
    getKey: (item: Account) => item.address,
  }),
);

export const useAccounts = () => {
  const query = useLiveQuery(accountsCollection);
  const accounts = query.state ? Array.from(query.state.values()) : [];
  const accountsMap = useMemo(() => {
    const map = new Map();
    for (const a of accounts) {
      map.set(a.address, a.username);
    }
    return map;
  }, [accounts]);
  return { ...query, data: accountsMap };
};

export const useAccount = (identifier: string | undefined) => {
  const checksumedAddress = useMemo(() => {
    try {
      return getChecksumAddress(identifier ?? "0x0");
    } catch (_err) {
      return identifier;
    }
  }, [identifier]);

  const { data, ...rest } = useLiveQuery(
    (q) =>
      q
        .from({ user: accountsCollection })
        .fn.where(({ user }) => {
          return (
            user.username === checksumedAddress ||
            user.address === checksumedAddress
          );
        })
        .select(({ user }) => ({ ...user })),
    [identifier, checksumedAddress],
  );
  if (!data || data.length < 1) {
    return { data: null, ...rest };
  }

  return { data: data[0], ...rest };
};

export const useAccountByAddress = (address: string | undefined) => {
  const { data, ...rest } = useLiveQuery(
    (q) =>
      q
        .from({ user: accountsCollection })
        .where(({ user }) =>
          eq(user.address, getChecksumAddress(address ?? "0x0")),
        )
        .select(({ user }) => ({ ...user })),
    [address],
  );

  if (!data || data.length < 1) {
    return { data: null, ...rest };
  }

  return { data: data[0], ...rest };
};
export const useAccountByUsername = (username: string | undefined) => {
  const { data, ...rest } = useLiveQuery(
    (q) =>
      q
        .from({ user: accountsCollection })
        .where(({ user }) => eq(user.username, username))
        .select(({ user }) => ({ ...user })),
    [username],
  );
  if (!data || data.length < 1) {
    return { data: null, ...rest };
  }

  return { data: data[0], ...rest };
};

export const useAccountsByAddresses = (addresses: string[]) => {
  const query = useLiveQuery(accountsCollection);
  const checksumAddresses = addresses.map(getChecksumAddress);
  const accounts = query.state
    ? Array.from(query.state.values()).filter((a: Account) =>
        checksumAddresses.includes(a.address),
      )
    : [];
  return { ...query, data: accounts };
};
