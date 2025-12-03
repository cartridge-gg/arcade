import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { CartridgeInternalGqlClient, graphqlLayer } from "../layers/graphql";

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

export type ActivityMeta = {
  project: string;
  address: string;
  limit: number;
  count: number;
};

export type Activity = {
  contractAddress: string;
  entrypoint: string;
  executedAt: string;
  callerAddress: string;
  transactionHash: string;
};

export type ActivityItem = {
  meta: ActivityMeta;
  activities: Activity[];
};

type ActivitiesResponse = {
  activities: {
    items: ActivityItem[];
  };
};

export type ActivityProject = {
  project: string;
  address: string;
  limit: number;
};

const fetchActivitiesEffect = (projects: ActivityProject[]) =>
  Effect.gen(function* () {
    const client = yield* CartridgeInternalGqlClient;
    const data = yield* client.query<ActivitiesResponse>(ACTIVITIES_QUERY, {
      projects,
    });
    return data.activities.items;
  });

const activitiesRuntime = Atom.runtime(graphqlLayer);

const activitiesFamily = Atom.family((key: string) => {
  const projects: ActivityProject[] = JSON.parse(key);
  return activitiesRuntime
    .atom(fetchActivitiesEffect(projects))
    .pipe(Atom.keepAlive);
});

export const activitiesAtom = (projects: ActivityProject[]) => {
  const sortedKey = JSON.stringify(
    [...projects].sort((a, b) => a.project.localeCompare(b.project)),
  );
  return activitiesFamily(sortedKey);
};
