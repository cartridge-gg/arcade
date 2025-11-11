import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { graphqlClient } from "./graphql-client";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { useState } from "react";
import makeBlockie from "ethereum-blockies-base64";
import { erc20Metadata } from "@cartridge/presets";
import { useAccount } from "@starknet-react/core";
import { useAddress } from "@/hooks/address";

const LIMIT = 1000;

export type Balance = {
  amount: number;
  value: number;
  change: number;
};

export type Metadata = {
  name: string;
  symbol: string;
  decimals: number;
  address?: string;
  image?: string;
  project?: string;
};

export type Token = {
  balance: Balance;
  metadata: Metadata;
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
}
`;

export function useBalancesQuery(projects: string[]) {
  const { address } = useAddress();
  const { address: connectedAddress } = useAccount();
  const [offset, setOffset] = useState(0);

  return useQuery({
    queryKey: queryKeys.prices.balance(address),
    enabled: address !== "0x0" || undefined !== connectedAddress,
    queryFn: async () => {
      const res = await graphqlClient(BALANCES_QUERY, {
        accountAddress: addAddressPadding(address.toLowerCase()),
        projects,
        limit: LIMIT,
        offset,
      });

      const newTokens: { [key: string]: Token } = {};
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
        const address = getChecksumAddress(contractAddress);
        const image =
          erc20Metadata.find(
            (m) => getChecksumAddress(m.l2_token_address) === address,
          )?.logo_url || makeBlockie(address);
        const token: Token = {
          balance: {
            amount: amount,
            value: value,
            change,
          },
          metadata: {
            project,
            name,
            symbol,
            decimals,
            address: address,
            image,
          },
        };
        newTokens[`${address}`] = token;
      }
      if (res.balances?.edges.length === LIMIT) {
        setOffset(offset + LIMIT);
      }

      return newTokens;
    },
  });
}
