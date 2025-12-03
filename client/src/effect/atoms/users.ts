import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { getChecksumAddress } from "starknet";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";
import { mapResult } from "../utils/result";

const ACCOUNTS_QUERY = `query GetControllers {
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
}`;

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

const fetchAccountsEffect = Effect.gen(function* () {
  const client = yield* CartridgeInternalGqlClient;
  const data = yield* client.query<AccountNamesResponse>(ACCOUNTS_QUERY, {});

  const accounts: Account[] = [];
  for (const edge of data.accounts.edges) {
    const controllerAddress = edge.node.controllers?.edges?.[0]?.node?.address;
    if (controllerAddress) {
      accounts.push({
        address: getChecksumAddress(controllerAddress),
        username: edge.node.username,
      });
    }
  }

  return accounts;
});

const accountsRuntime = Atom.runtime(graphqlLayer);

export const accountsAtom = accountsRuntime
  .atom(fetchAccountsEffect)
  .pipe(Atom.keepAlive);

const nullResultAtom = Atom.make(
  () => ({ _tag: "Success", value: null }) as const,
);

export const accountAtom = Atom.family((identifier: string | undefined) => {
  if (!identifier) return nullResultAtom;

  const checksumAddress = (() => {
    try {
      return getChecksumAddress(identifier);
    } catch {
      return identifier;
    }
  })();

  return accountsAtom.pipe(
    Atom.map((result) =>
      mapResult(
        result,
        (accounts) =>
          accounts.find(
            (a) =>
              a.username === checksumAddress || a.address === checksumAddress,
          ) ?? null,
      ),
    ),
  );
});

export const accountByAddressAtom = Atom.family(
  (address: string | undefined) => {
    if (!address) return nullResultAtom;

    const checksumAddress = getChecksumAddress(address);

    return accountsAtom.pipe(
      Atom.map((result) =>
        mapResult(
          result,
          (accounts) =>
            accounts.find((a) => a.address === checksumAddress) ?? null,
        ),
      ),
    );
  },
);

export const accountByUsernameAtom = Atom.family(
  (username: string | undefined) => {
    if (!username) return nullResultAtom;

    return accountsAtom.pipe(
      Atom.map((result) =>
        mapResult(
          result,
          (accounts) => accounts.find((a) => a.username === username) ?? null,
        ),
      ),
    );
  },
);

const accountsByAddressesFamily = Atom.family((key: string) => {
  const checksumAddresses: string[] = JSON.parse(key);

  return accountsAtom.pipe(
    Atom.map((result) =>
      mapResult(result, (accounts) =>
        accounts.filter((a) => checksumAddresses.includes(a.address)),
      ),
    ),
  );
});

export const accountsByAddressesAtom = (addresses: string[]) => {
  const checksumAddresses = addresses.map(getChecksumAddress).sort();
  return accountsByAddressesFamily(JSON.stringify(checksumAddresses));
};

export const accountsMapAtom = accountsAtom.pipe(
  Atom.map((result) =>
    mapResult(result, (accounts) => {
      const map = new Map<string, string>();
      for (const a of accounts) {
        map.set(a.address, a.username);
      }
      return map;
    }),
  ),
  Atom.keepAlive,
);
