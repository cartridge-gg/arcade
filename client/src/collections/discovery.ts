import { createCollection, eq, inArray, liveQueryCollectionOptions, useLiveQuery } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { graphqlClient } from "@/queries/graphql-client";
import { EditionModel, editionsQuery, editionsWithGames, GameModel } from "./arcade";
import { getChecksumAddress } from "starknet";
import { achievementsCollection } from "./achievements";
import { queryClient } from "@/queries";
import { accountsCollection } from "./users";
import { cyrb64Hash } from "./utils";

export type PlaythroughProject = {
  project: string;
  address?: string;
  limit?: number;
}

export type Metric = {
  id: string;
  name: string;
  value: number;
  category: string;
  timestamp: string;
  project: string;
  metadata?: any;
}

export type Playthrough = {
  identifier: string,
  edition: string,
  callerAddress: string,
  count: number,
  actions: string[],
  start: number,
  end: number,
  achievements: string[],
}

type MetricsResponse = {
  metrics: {
    items: Array<{
      meta: {
        project: string;
      };
      metrics: Array<{
        id: string;
        name: string;
        value: number;
        category: string;
        timestamp: string;
        metadata?: any;
      }>;
    }>;
  };
}

type PlaythroughsResponse = {
  playthroughs: {
    items: Array<{
      meta: { project: string },
      playthroughs: {
        actionCount: number;
        callerAddress: string;
        entrypoints: string;
        sessionStart: string;
        sessionEnd: string;
      };
    }>;
  };
}

const METRICS_QUERY = `
  query GetMetrics($projects: [String!]!, $category: String, $limit: Int) {
    metrics(projects: $projects, category: $category, limit: $limit) {
      items {
        meta {
          project
        }
        metrics {
          id
          name
          value
          category
          timestamp
          metadata
        }
      }
    }
  }
`;

const PLAYTHROUGHS_QUERY = `
    query GetPlaythroughs($projects: [PlaythroughProject!]!) {
      playthroughs(projects: $projects) {
        items {
          meta {
            project
          }
          playthroughs {
            sessionStart
            sessionEnd
            callerAddress
            actionCount
            entrypoints
          }
        }
      }
    }
  `;

export const metricsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (() => {
      const editions = editionsQuery.toArray
      const projects = editions.map(e => ({ project: e.config.project, limit: 1000 })).sort();
      return ['collection', 'discovery', 'metrics', projects];
    })(),
    queryFn: async () => {
      const editions = await editionsQuery.toArrayWhenReady();
      const projects = editions.map(e => ({ project: e.config.project, limit: 1000 }))

      const data = await graphqlClient<MetricsResponse>(
        METRICS_QUERY,
        {
          projects,
        }
      );

      const metrics: Metric[] = [];
      data.metrics?.items?.forEach((item) => {
        item.metrics?.forEach((metric) => {
          metrics.push({
            ...metric,
            project: item.meta.project,
          });
        });
      });

      return metrics;
    },
    queryClient,
    getKey: (item: Metric) => `${item.project}-${item.id}`,
    schema: {
      validate: (item: unknown): item is Metric => {
        const m = item as Metric;
        return typeof m.id === 'string' &&
          typeof m.name === 'string' &&
          typeof m.value === 'number' &&
          typeof m.category === 'string' &&
          typeof m.project === 'string';
      }
    }
  })
);

export const playthroughsCollection = createCollection(
  queryCollectionOptions({
    queryKey: (() => {
      const editions = editionsQuery.toArray
      const projects = editions.map(e => ({ project: e.config.project, limit: 1000 })).sort();
      const achievements = achievementsCollection.toArray;
      return ['collection', 'discovery', 'playthroughs', projects,
        { achievements: cyrb64Hash(achievements.map(p => p.key).sort().join('///')), length: achievements.length },
      ];
    })(),
    queryFn: async () => {
      const editions = await editionsQuery.toArrayWhenReady();
      const achievements = await achievementsCollection.toArrayWhenReady();

      const projects = editions.map(e => ({ project: e.config.project, limit: 1000 }))
      const data = await graphqlClient<PlaythroughsResponse>(
        PLAYTHROUGHS_QUERY,
        { projects }
      );

      const playthroughs: Playthrough[] = data.playthroughs?.items.flatMap(p => {
        return p.playthroughs.map((i) => {
          const start = new Date(i.sessionStart).getTime();
          const end = new Date(i.sessionEnd).getTime();
          const callerAddress = getChecksumAddress(i.callerAddress)
          const playerAchievements = achievements.filter(a => a.edition === p.meta.project && a.playerId === callerAddress && a.timestamp * 1000 >= start && a.timestamp * 1000 <= end);
          return {
            identifier: `${p.meta.project}-${i.callerAddress}-${i.sessionStart}`,
            edition: p.meta.project,
            callerAddress,
            count: i.actionCount,
            actions: i.entrypoints.slice(1, -1).split(","),
            start,
            end,
            achievements: playerAchievements,
          }
        });
      });
      return playthroughs;
    },
    queryClient,
    getKey: (item: Playthrough) => item.identifier,
  })
);

function buildGamePath(gameName: string, editionName?: string) {
  if (editionName) {
    const edition = editionName.toLowerCase().replace(/ /g, "-");
    return `/game/${gameName}/edition/${edition}`;
  }
  return `/game/${gameName}`
}

function createEventLink(game: GameModel, edition: EditionModel, nameOrAddress: string) {
  // If there are several games displayed, then clicking a card links to the game
  const gameName = game?.name || game._edition.gameId.toString();
  const editionName = edition?.name || edition.id.toString();
  if (game.id !== 0) {
    return buildGamePath(gameName, editionName);
  }
  return "/";
}

export const allEventsCollection = createCollection(liveQueryCollectionOptions({
  query: q => q
    .from({ p: playthroughsCollection })
    .orderBy(({ p }) => p.start, 'desc')
    .orderBy(({ p }) => p.end, 'desc')
    .innerJoin({ eg: editionsWithGames }, ({ p, eg }) => eq(eg._edition.config.project, p.edition))
    .innerJoin({ u: accountsCollection }, ({ p, u }) => eq(u.address, p.callerAddress))
    .fn.select(({ p, eg, u, }) => {
      return {
        identifier: p.identifier,
        name: u.username,
        address: p.callerAddress,
        duration: p.end - p.start,
        count: p.count,
        actions: p.actions,
        achievements: [...p.achievements],
        timestamp: Math.floor(p.end / 1000),
        logo: eg._edition.properties.icon,
        color: eg._edition.color,
        link: createEventLink(eg, eg._edition, u.username || p.callerAddress),
      }
    })
}))

export function useDiscovers() {
  const { data: all, status } = useLiveQuery(q => q
    .from({ evts: allEventsCollection })
    .orderBy(({ evts }) => evts.timestamp, 'desc')
    .select(({ evts }) => ({ ...evts }))
  );
  const { data: following } = useLiveQuery(q => q
    .from({ evts: allEventsCollection })
    .orderBy(({ evts }) => evts.timestamp, 'desc')
    .where(({ evts }) => inArray(evts.address, []))
    .select(({ evts }) => ({ ...evts }))
  );

  return { all, following, status };
}

export function usePlaythroughs() {
  const { data: playthroughs } = useLiveQuery(q => q
    .from({ playthroughs: playthroughsCollection })
    .select(({ playthroughs }) => ({ ...playthroughs }))
    .orderBy(({ playthroughs }) => playthroughs.start, 'desc')
  );
  return playthroughs;
}
