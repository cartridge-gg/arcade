import {
  createCollection,
  eq,
  liveQueryCollectionOptions,
  useLiveQuery,
} from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/keys";
import {
  Registry,
  Social,
  GameModel,
  EditionModel,
  AccessModel,
  RegistryModel,
  SocialModel,
  PinEvent,
  FollowEvent,
  GuildModel,
  CollectionEditionModel,
} from "@cartridge/arcade";
import { constants, getChecksumAddress } from "starknet";
import { useMemo } from "react";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

// Type discriminated union for Registry models
export interface RegistryItem {
  type: "game" | "edition" | "access" | "collectionEdition";
  identifier: string;
  data: GameModel | EditionModel | AccessModel | CollectionEditionModel;
}

// Type discriminated union for Social models
export interface SocialItem {
  type: "pin" | "follow" | "guild";
  key: string;
  data: PinEvent | FollowEvent | GuildModel;
}

// Main Registry collection - fetches all registry data in one call
export const arcadeRegistryCollection = createCollection(
  queryCollectionOptions({
    queryKey: [...queryKeys.games.all, "registry"],
    queryFn: async () => {
      await Registry.init(CHAIN_ID);
      const items: RegistryItem[] = [];

      await Registry.fetch(
        (models: RegistryModel[]) => {
          models.forEach((model) => {
            if (GameModel.isType(model as GameModel)) {
              const game = model as GameModel;
              if (game.exists()) {
                items.push({
                  type: "game",
                  identifier: game.identifier,
                  data: game,
                });
                return;
              }
            }
            if (EditionModel.isType(model as EditionModel)) {
              const edition = model as EditionModel;
              if (edition.exists()) {
                items.push({
                  type: "edition",
                  identifier: edition.identifier,
                  data: edition,
                });
                return;
              }
            }
            if (AccessModel.isType(model as AccessModel)) {
              const access = model as AccessModel;
              if (access.exists()) {
                items.push({
                  type: "access",
                  identifier: access.identifier,
                  data: access,
                });
                return;
              }
            }
            if (
              CollectionEditionModel.isType(model as CollectionEditionModel)
            ) {
              const collectionEdition = model as CollectionEditionModel;
              if (collectionEdition.exists()) {
                items.push({
                  type: "collectionEdition",
                  identifier: collectionEdition.identifier,
                  data: collectionEdition,
                });
                return;
              }
            }
          });
        },
        { game: true, edition: true, access: true, collectionEdition: true },
      );

      return items;
    },
    queryClient: new QueryClient(),
    getKey: (item: RegistryItem) => `${item.type}-${item.identifier}`,
  }),
);

// Main Social collection - fetches all social data in one call
export const arcadeSocialCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["arcade", "social"],
    queryFn: async () => {
      await Social.init(CHAIN_ID);
      const items: SocialItem[] = [];

      await Social.fetch(
        (models: SocialModel[]) => {
          models.forEach((model) => {
            if (PinEvent.isType(model as PinEvent)) {
              const pin = model as PinEvent;
              if (pin.time > 0) {
                const playerId = getChecksumAddress(pin.playerId);
                items.push({
                  type: "pin",
                  key: `${playerId}-${pin.achievementId}`,
                  data: pin,
                });
                return;
              }
            }
            if (FollowEvent.isType(model as FollowEvent)) {
              const follow = model as FollowEvent;
              if (follow.time > 0) {
                const follower = getChecksumAddress(follow.follower);
                const followed = getChecksumAddress(follow.followed);
                items.push({
                  type: "follow",
                  key: `${follower}-${followed}`,
                  data: follow,
                });
                return;
              }
            }
            if (GuildModel.isType(model as GuildModel)) {
              const guild = model as GuildModel;
              if (guild.exists()) {
                items.push({
                  type: "guild",
                  key: guild.id.toString(),
                  data: guild,
                });
                return;
              }
            }
          });
        },
        { pin: true, follow: true, guild: true },
      );

      return items;
    },
    queryClient: new QueryClient(),
    getKey: (item: SocialItem) => `${item.type}-${item.key}`,
  }),
);

// Derived queries for specific model types
export const gamesQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ item: arcadeRegistryCollection })
        .where(({ item }) => eq(item.type, "game"))
        .orderBy(({ item }) => (item.data as unknown as GameModel).name, "desc")
        .fn.select(({ item }) => {
          return item.data as unknown as GameModel;
        }),
    getKey: (item) => item.identifier,
  }),
);

export const editionsQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ item: arcadeRegistryCollection })
        .where(({ item }) => eq(item.type, "edition"))
        .fn.select(({ item }) => {
          return { ...item.data } as EditionModel;
        }),
    getKey: (item) => item.identifier,
  }),
);

export const editionsWithGames = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ e: editionsQuery })
        .innerJoin({ g: gamesQuery }, ({ e, g }) => eq(e.gameId, g.id))
        .orderBy(({ g }) => g.name, "asc")
        .select(({ e, g }) => ({
          project: e.config.project,
          _edition: e,
          _game: { ...g },
        })),
  }),
);

export const collectionEditionsQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ item: arcadeRegistryCollection })
        .where(({ item }) => eq(item.type, "collectionEdition"))
        .select(({ item }) => ({ ...item.data })),
    getKey: (item) => item.identifier,
  }),
);

const accessesQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ item: arcadeRegistryCollection })
        .where(({ item }) => eq(item.type, "access")),
    getKey: (item) => item.identifier,
  }),
);

const pinsQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ item: arcadeSocialCollection })
        .where(({ item }) => eq(item.type, "pin")),
    getKey: (item) =>
      `${getChecksumAddress((item.data as PinEvent).playerId)}-${(item.data as PinEvent).achievementId}`,
  }),
);

const followsQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ item: arcadeSocialCollection })
        .where(({ item }) => eq(item.type, "follow")),
    getKey: (item) =>
      `${getChecksumAddress((item.data as FollowEvent).follower)}-${getChecksumAddress((item.data as FollowEvent).followed)}`,
  }),
);

const guildsQuery = createCollection(
  liveQueryCollectionOptions({
    query: (q) =>
      q
        .from({ item: arcadeSocialCollection })
        .where(({ item }) => eq(item.type, "guild")),
    getKey: (item) => (item.data as GuildModel).id.toString(),
  }),
);

// Hook functions for accessing the collections
export function useGames() {
  const { data } = useLiveQuery((q) =>
    q
      .from({ games: gamesQuery })
      .orderBy(({ games }) => games.name, "asc")
      .select(({ games }) => ({ ...games })),
  );
  return data || [];
}

export function useEditions() {
  const { data } = useLiveQuery((q) =>
    q
      .from({ editions: editionsQuery })
      .orderBy(({ editions }) => editions.priority, "desc")
      .orderBy(({ editions }) => editions.id, "asc")
      .select(({ editions }) => ({ ...editions })),
  );
  return data || [];
}

export function useEditionsMap() {
  const editions = useEditions();
  const editionsMap = useMemo(() => {
    const map = new Map();
    editions.forEach((e) => map.set(e.config.project, e));
    return map;
  }, [editions]);
  return editionsMap;
}

export function useCollectionEditions() {
  const { data } = useLiveQuery((q) =>
    q
      .from({ collectionEditions: collectionEditionsQuery })
      .select(({ collectionEditions }) => ({ ...collectionEditions })),
  );
  return data || [];
}

export function useAccesses() {
  const { data } = useLiveQuery((q) =>
    q
      .from({ accesses: accessesQuery })
      .orderBy(({ accesses }) => accesses.identifier, "asc")
      .select(({ accesses }) => ({ ...accesses })),
  );
  return data || [];
}

export function usePins(playerId?: string) {
  const { data } = useLiveQuery((q) => {
    let query = q.from({ pins: pinsQuery });
    if (playerId) {
      const checksumAddress = getChecksumAddress(playerId);
      query = query.where(({ pins }) =>
        eq(
          getChecksumAddress((pins.data as PinEvent).playerId),
          checksumAddress,
        ),
      );
    }
    return query.select(({ pins }) => ({ ...pins }));
  });
  return data || [];
}

export function useFollows(follower?: string) {
  const { data } = useLiveQuery((q) => {
    let query = q.from({ follows: followsQuery });
    if (follower) {
      const checksumAddress = getChecksumAddress(follower);
      query = query.where(({ follows }) =>
        eq(
          getChecksumAddress((follows.data as FollowEvent).follower),
          checksumAddress,
        ),
      );
    }
    return query.select(({ follows }) => ({ ...follows }));
  });
  return data || [];
}

export function useGuilds() {
  const { data } = useLiveQuery((q) =>
    q
      .from({ guilds: guildsQuery })
      .select(({ guilds }) => ({ ...guilds }))
      .orderBy(({ guilds }) => {
        const guildData = guilds.data as unknown as GuildModel;
        return (guildData.metadata as any)?.name || "";
      }),
  );
  return data || [];
}

// Re-export types for convenience
export type {
  GameModel,
  EditionModel,
  AccessModel,
  PinEvent,
  FollowEvent,
  GuildModel,
};
