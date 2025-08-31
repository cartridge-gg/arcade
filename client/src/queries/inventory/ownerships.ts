import { useMemo } from "react";
import { useQuery, UseBaseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";
import { useAccount } from "@starknet-react/core";
import { DEFAULT_PROJECT_QUERY } from "@/constants";

export interface Ownership {
  ownerAddress: string;
  contractAddress: string;
  tokenId: string;
  amount: string;
  project: string;
  timestamp: number;
}

export interface OwnershipsResponse {
  ownerships: {
    items: Ownership[];
    totalCount: number;
  };
}

const OWNERSHIPS_QUERY = `
  query GetOwnerships($projects: [String!]!) {
    ownerships(projects: $projects) {
      items {
        ownerships {
          contractAddress
          accountAddress
          tokenId
          balance
        }
      }
    }
  }
`;

export function useOwnershipsQuery(): UseBaseQueryResult<Ownership[]> {
  const { address = '' } = useAccount();
  const projects = [DEFAULT_PROJECT_QUERY];
  
  const result = useQuery({
    queryKey: queryKeys.inventory.ownerships(address, projects),
    queryFn: async () => {
      const data = await graphqlClient<{ ownerships: { items: any[] } }>(
        OWNERSHIPS_QUERY,
        { projects }
      );
      return data;
    },
    enabled: !!address && projects.length > 0,
    ...queryConfigs.inventory,
  });

  const ownerships = useMemo(() => {
    if (!result.data) return [];

    return result.data?.items
      .flatMap((item) => {
        return item.ownerships.map((ownership) => {
          const contractAddress = ownership.contractAddress;
          const accountAddress = ownership.accountAddress;
          const tokenId = BigInt(ownership.tokenId);
          const balance = BigInt(ownership.balance);
          return {
            contractAddress,
            accountAddress,
            tokenId,
            balance,
          };
        });
      })
      .filter((item) => BigInt(item.balance) != 0n) || [];

  }, [result])
  // Return with proper typing
  return {
    ...result,
    data: ownerships,
  };
}
