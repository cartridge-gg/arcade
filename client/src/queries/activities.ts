import { graphqlClient, queryKeys } from "@/queries";
import { useActivitiesEditions } from "../collections/arcade";
import { useQuery } from "@tanstack/react-query";
import { useArcade } from "@/hooks/arcade";

const ACTIVITIES_QUERY = `query Activities($projects: [ActivityProject!]!) {
  activities(projects: $projects) {
    items {
      meta {
        project
        address
        limit
        count
      }
      activities {
        contractAddress
        entrypoint
        executedAt
        callerAddress
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
type Activity = {
  contractAddress: string;
  entrypoint: string;
  executedAt: string;
  callerAddress: string;
  transactionHash: string;
};
type Response = {
  activities: {
    activities: { items: { meta: Meta; activities: Activity[] }[] };
  };
};

export function useActivitiesQuery() {
  const { player: address = "0x0" } = useArcade();
  const projects = useActivitiesEditions(address);
  return useQuery({
    queryKey: queryKeys.activities.address(
      projects.map((p) => p.address),
      address,
    ),
    queryFn: async () => {
      const data: Response = await graphqlClient(ACTIVITIES_QUERY, {
        projects: projects,
      });
      return data.activities;
    },
  });
}
