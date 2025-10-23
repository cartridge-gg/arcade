export const queryKeys = {
  achievements: {
    all: ["achievements"] as const,
    trophies: (projects?: string[]) =>
      projects
        ? ([...queryKeys.achievements.all, "trophies", projects] as const)
        : ([...queryKeys.achievements.all, "trophies"] as const),
    completed: (address: string, projects?: string[]) =>
      projects
        ? ([
            ...queryKeys.achievements.all,
            "completed",
            address,
            projects,
          ] as const)
        : ([...queryKeys.achievements.all, "completed", address] as const),
    progress: (address: string, project: string) =>
      [...queryKeys.achievements.all, "progress", address, project] as const,
  },

  progressions: {
    all: ["progressions", "all"] as const,
  },

  activities: {
    all: ["activities"] as const,
    transfers: (address?: string) =>
      address
        ? ([...queryKeys.activities.all, "transfers", address] as const)
        : ([...queryKeys.activities.all, "transfers"] as const),
    events: (editions?: string[]) =>
      editions
        ? ([...queryKeys.activities.all, "events", editions] as const)
        : ([...queryKeys.activities.all, "events"] as const),
    address: (projects: string[], address: string) =>
      [
        ...queryKeys.activities.all,
        "projects",
        projects.join(","),
        address,
      ] as const,
  },
  prices: {
    addresses: (addresses: string[]) =>
      ["prices", addresses.join(",")] as const,
    periodAndAddresses: (addresses: string[], start: string, end: string) =>
      ["prices", addresses.join(","), start, end] as const,
    credits: (address: string) =>
      ["prices", "credits", "address", address] as const,
    balance: (address: string) => ["prices", "balance", address] as const,
  },

  marketplace: {
    all: ["marketplace"] as const,
    collection: (collection: string) =>
      [...queryKeys.marketplace.all, "collection", collection] as const,
    listing: (id: string) =>
      [...queryKeys.marketplace.all, "listing", id] as const,
    filters: (collection: string) =>
      [...queryKeys.marketplace.all, "filters", collection] as const,
  },

  inventory: {
    all: ["inventory"] as const,
    user: (address: string) => [...queryKeys.inventory.all, address] as const,
    collection: (address: string, collection: string) =>
      [...queryKeys.inventory.all, address, collection] as const,
  },

  tokens: {
    all: ["tokens"] as const,
    collections: ["tokens", "collections"],
    balance: (address: string, token?: string) =>
      token
        ? ([...queryKeys.tokens.all, "balance", address, token] as const)
        : ([...queryKeys.tokens.all, "balance", address] as const),
    metadata: (token: string) =>
      [...queryKeys.tokens.all, "metadata", token] as const,
  },

  users: {
    all: ["users"] as const,
    profile: (address: string) =>
      [...queryKeys.users.all, "profile", address] as const,
    accounts: () => [...queryKeys.users.all, "accounts"] as const,
  },

  metadata: {
    all: ["metadata"] as const,
    traits: (
      contractAddress: string,
      traits: { name: string; value: string }[],
    ) =>
      [
        ...queryKeys.metadata.all,
        "traits",
        contractAddress,
        traits.map((t) => `${t.name}-${t.value}`).join("-"),
      ] as const,
  },

  discovery: {
    all: ["discovery"] as const,
    events: (editions?: string[]) =>
      editions
        ? ([...queryKeys.discovery.all, "events", editions] as const)
        : ([...queryKeys.discovery.all, "events"] as const),
    trending: () => [...queryKeys.discovery.all, "trending"] as const,
  },

  games: {
    all: ["games"] as const,
    registry: () => [...queryKeys.games.all, "registry"] as const,
    game: (identifier: string) => [...queryKeys.games.all, identifier] as const,
    edition: (identifier: string) =>
      [...queryKeys.games.all, "edition", identifier] as const,
    social: () => [...queryKeys.games.all, "social"] as const,
  },

  torii: {
    all: ["torii"] as const,
    client: (rpc: string) => [...queryKeys.torii.all, "client", rpc] as const,
  },
  ownerships: {
    arcade: ["arcade-game", "ownerships"] as const,
  },
  metrics: {
    projects: (projects: string[]) =>
      ["metrics", "projects", projects.join(",")] as const,
  },
} as const;

export type QueryKey =
  | ReturnType<typeof queryKeys.achievements.trophies>
  | ReturnType<typeof queryKeys.achievements.completed>
  | ReturnType<typeof queryKeys.achievements.progress>
  | ReturnType<typeof queryKeys.activities.transfers>
  | ReturnType<typeof queryKeys.activities.events>
  | ReturnType<typeof queryKeys.marketplace.collection>
  | ReturnType<typeof queryKeys.marketplace.listing>
  | ReturnType<typeof queryKeys.marketplace.filters>
  | ReturnType<typeof queryKeys.inventory.user>
  | ReturnType<typeof queryKeys.inventory.collection>
  | ReturnType<typeof queryKeys.tokens.balance>
  | ReturnType<typeof queryKeys.tokens.metadata>
  | ReturnType<typeof queryKeys.users.profile>
  | ReturnType<typeof queryKeys.users.accounts>
  | ReturnType<typeof queryKeys.discovery.events>
  | ReturnType<typeof queryKeys.discovery.trending>
  | ReturnType<typeof queryKeys.games.registry>
  | ReturnType<typeof queryKeys.games.game>
  | ReturnType<typeof queryKeys.games.edition>
  | ReturnType<typeof queryKeys.games.social>
  | ReturnType<typeof queryKeys.torii.client>;
