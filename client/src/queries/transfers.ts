import { useActivitiesEditions } from "@/collections";
import { useArcade } from "@/hooks/arcade";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { graphqlClient } from "./graphql-client";

const TRANSFER_QUERY = `query Transfers($projects: [TransferProject!]!) {
  transfers(projects: $projects) {
    items {
      meta {
        project
        address
        date
        limit
        count
      }
      transfers {
        amount
        decimals
        metadata
        name
        symbol
        contractAddress
        executedAt
        fromAddress
        toAddress
        tokenId
        eventId
        transactionHash
      }
    }
  }
}`;
type Meta = {
  project: string;
  address: string;
  date: string;
  limit: number;
  count: number;
};
type Transfer = {
  amount: string;
  decimals: string;
  name: string;
  symbol: string;
  contractAddress: string;
  metadata: any;
  executedAt: string;
  fromAddress: string;
  toAddress: string;
  tokenId: string;
  eventId: string;
  transactionHash: string;
};
type Response = {
  transfers: { transfers: { items: { meta: Meta; transfers: Transfer[] }[] } };
};

export function useTransfersQuery() {
  const { player: address = "0x0" } = useArcade();
  const projects = useActivitiesEditions(address);
  return useQuery({
    queryKey: queryKeys.activities.transfers(address),
    queryFn: async () => {
      const data: Response = await graphqlClient(TRANSFER_QUERY, {
        projects: projects.map((p) => ({ ...p, date: "" })),
      });
      return data.transfers;
    },
  });
}
