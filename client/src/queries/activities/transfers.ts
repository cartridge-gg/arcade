import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";

export interface TransferProject {
  project: string;
  address: string;
  limit?: number;
  date?: string;
}

export interface Transfer {
  tokenId: string;
  amount: string;
  decimals: string;
  symbol: string;
  contractAddress: string;
  transactionHash: string;
  eventId: string;
  fromAddress: string;
  toAddress: string;
  executedAt: string;
  name?: string;
  metadata?: any;
}

export interface TransfersResponse {
  transfers: {
    items: {
      meta: { project: string };
      transfers: Transfer[];
    }[];
  };
}

const TRANSFERS_QUERY = `
  query GetTransfers($projects: [TransferProject!]!) {
    transfers(projects: $projects) {
      items {
        meta {
          project
        }
        transfers {
          tokenId
          amount
          decimals
          symbol
          contractAddress
          transactionHash
          eventId
          fromAddress
          toAddress
          executedAt
          name
          metadata
        }
      }
    }
  }
`;

export function useTransfersQuery(
  address: string,
  projects: TransferProject[],
) {
  const result = useQuery({
    queryKey: queryKeys.activities.transfers(address, projects),
    queryFn: async () => {
      const data = await graphqlClient<TransfersResponse>(
        TRANSFERS_QUERY,
        { projects }
      );
      return data;
    },
    enabled: !!address && projects.length > 0,
    ...queryConfigs.activities,
  });

  // Return with proper typing
  return {
    ...result,
    data: result.data as TransfersResponse | undefined,
  };
}
