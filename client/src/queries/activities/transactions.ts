import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { queryConfigs } from "../queryClient";
import { graphqlClient } from "../graphql-client";

export interface ActivityProject {
  project: string;
  address: string;
  limit?: number;
}

export interface Activity {
  transactionHash: string;
  executedAt: string;
  eventId: string;
  type: string;
  data: any;
  metadata?: any;
}

export interface ActivitiesResponse {
  activities: {
    items: {
      meta: { project: string };
      activities: Activity[];
    }[];
  };
}

const ACTIVITIES_QUERY = `
  query GetActivities($projects: [ActivityProject!]!) {
    activities(projects: $projects) {
      items {
        meta {
          project
        }
        activities {
          transactionHash
          executedAt
          eventId
          type
          data
          metadata
        }
      }
    }
  }
`;

export function useActivitiesQuery(
  address: string,
  projects: ActivityProject[],
  limit?: number,
) {
  const result = useQuery({
    queryKey: queryKeys.activities.transactions(address, projects, limit),
    queryFn: async () => {
      const data = await graphqlClient<ActivitiesResponse>(
        ACTIVITIES_QUERY,
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
    data: result.data as ActivitiesResponse | undefined,
  };
}
