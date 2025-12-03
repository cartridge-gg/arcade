import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { getChecksumAddress, addAddressPadding } from "starknet";
import makeBlockie from "ethereum-blockies-base64";
import { erc20Metadata } from "@cartridge/presets";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";

const LIMIT = 1000;

export type Balance = {
  amount: number;
  value: number;
  change: number;
};

export type TokenMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  image?: string;
  project?: string;
};

export type Token = {
  balance: Balance;
  metadata: TokenMetadata;
};

const BALANCES_QUERY = `query Balances(
  $projects: [String!]
  $accountAddress: String!
  $first: Int
  $last: Int
  $before: Cursor
  $after: Cursor
  $offset: Int
  $limit: Int
) {
  balances(
    projects: $projects
    accountAddress: $accountAddress
    first: $first
    last: $last
    before: $before
    after: $after
    offset: $offset
    limit: $limit
  ) {
    totalCount
    edges {
      node {
        raw
        amount
        value
        meta {
          project
          decimals
          contractAddress
          name
          symbol
          price
          periodPrice
        }
      }
    }
  }
}`;

type BalancesResponse = {
  balances: {
    totalCount: number;
    edges: Array<{
      node: {
        raw: string;
        amount: number;
        value: number;
        meta: {
          project: string;
          decimals: number;
          contractAddress: string;
          name: string;
          symbol: string;
          price: number;
          periodPrice: number;
        };
      };
    }>;
  };
};

const fetchBalancesEffect = (address: string, projects: string[], offset = 0) =>
  Effect.gen(function* () {
    const client = yield* CartridgeInternalGqlClient;
    const res = yield* client.query<BalancesResponse>(BALANCES_QUERY, {
      accountAddress: addAddressPadding(address.toLowerCase()),
      projects,
      limit: LIMIT,
      offset,
    });

    const tokens: { [key: string]: Token } = {};
    for (const e of res.balances.edges) {
      const { amount, value, meta } = e.node;
      const {
        project,
        decimals,
        contractAddress,
        name,
        symbol,
        price,
        periodPrice,
      } = meta;
      const previous = price !== 0 ? (value * periodPrice) / price : 0;
      const change = value - previous;
      const tokenAddress = getChecksumAddress(contractAddress);
      const image =
        erc20Metadata.find(
          (m) => getChecksumAddress(m.l2_token_address) === tokenAddress,
        )?.logo_url || makeBlockie(tokenAddress);
      const token: Token = {
        balance: {
          amount,
          value,
          change,
        },
        metadata: {
          project,
          name,
          symbol,
          decimals,
          address: tokenAddress,
          image,
        },
      };
      tokens[tokenAddress] = token;
    }

    return tokens;
  });

const balancesRuntime = Atom.runtime(graphqlLayer);

const balancesFamily = Atom.family((key: string) => {
  const { address, projects }: { address: string; projects: string[] } =
    JSON.parse(key);
  return balancesRuntime
    .atom(fetchBalancesEffect(address, projects))
    .pipe(Atom.keepAlive);
});

export const balancesAtom = (address: string, projects: string[]) => {
  const sortedKey = JSON.stringify({
    address,
    projects: [...projects].sort(),
  });
  return balancesFamily(sortedKey);
};
