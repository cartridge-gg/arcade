// Centralized query key factory for type-safe and consistent query keys

export const queryKeys = {
  // Achievements domain
  achievements: {
    all: ['achievements'] as const,
    trophies: (projects: any[]) => [...queryKeys.achievements.all, 'trophies', projects] as const,
    progressions: (projects: any[], address?: string) =>
      [...queryKeys.achievements.all, 'progressions', projects, address] as const,
    stats: (projects: any[], address?: string) =>
      [...queryKeys.achievements.all, 'stats', projects, address] as const,
  },

  // Activities domain
  activities: {
    all: ['activities'] as const,
    transfers: (address: string, projects: any[]) =>
      [...queryKeys.activities.all, 'transfers', address, projects] as const,
    transactions: (address: string, projects: any[], limit?: number) =>
      [...queryKeys.activities.all, 'transactions', address, projects, limit] as const,
    combined: (address: string, projects: any[]) =>
      [...queryKeys.activities.all, 'combined', address, projects] as const,
  },

  // Marketplace domain
  marketplace: {
    all: ['marketplace'] as const,
    orders: (collectionId: string, tokenId?: string) =>
      [...queryKeys.marketplace.all, 'orders', collectionId, tokenId] as const,
    sales: (collectionId: string, limit?: number) =>
      [...queryKeys.marketplace.all, 'sales', collectionId, limit] as const,
    listings: (collectionId: string, limit?: number) =>
      [...queryKeys.marketplace.all, 'listings', collectionId, limit] as const,
    stats: (collectionId: string) =>
      [...queryKeys.marketplace.all, 'stats', collectionId] as const,
  },

  // Inventory domain
  inventory: {
    all: ['inventory'] as const,
    collections: (address: string, projects: any[], offset?: number) =>
      [...queryKeys.inventory.all, 'collections', address, projects, offset] as const,
    collectibles: (address: string, projects: any[], offset?: number) =>
      [...queryKeys.inventory.all, 'collectibles', address, projects, offset] as const,
    ownerships: (address: string, projects: any[]) =>
      [...queryKeys.inventory.all, 'ownerships', address, projects] as const,
    tokens: (collectionId: string, tokenId: string, address: string) =>
      [...queryKeys.inventory.all, 'tokens', collectionId, tokenId, address] as const,
  },

  // Tokens domain
  tokens: {
    all: ['tokens'] as const,
    balances: (address: string, projects?: any[], offset?: number) =>
      [...queryKeys.tokens.all, 'balances', address, projects, offset] as const,
    erc20: (address: string, tokenAddress: string) =>
      [...queryKeys.tokens.all, 'erc20', address, tokenAddress] as const,
    prices: (tokens: string[]) =>
      [...queryKeys.tokens.all, 'prices', tokens] as const,
    credits: (address: string) =>
      [...queryKeys.tokens.all, 'credits', address] as const,
  },

  // Users domain
  users: {
    all: ['users'] as const,
    account: (address: string) =>
      [...queryKeys.users.all, 'account', address] as const,
    accounts: (addresses: string[]) =>
      [...queryKeys.users.all, 'accounts', addresses] as const,
    profile: (address: string) =>
      [...queryKeys.users.all, 'profile', address] as const,
  },

  // Discovery domain
  discovery: {
    all: ['discovery'] as const,
    playthroughs: (projects: any[], limit?: number) =>
      [...queryKeys.discovery.all, 'playthroughs', projects, limit] as const,
    metrics: (projects: any[]) =>
      [...queryKeys.discovery.all, 'metrics', projects] as const,
    analytics: (projectId: string, timeRange?: string) =>
      [...queryKeys.discovery.all, 'analytics', projectId, timeRange] as const,
  },

  // Games domain
  games: {
    all: ['games'] as const,
    registry: (chainId: string) =>
      [...queryKeys.games.all, 'registry', chainId] as const,
    game: (gameId: string) =>
      [...queryKeys.games.all, 'game', gameId] as const,
    edition: (gameId: string, editionId: string) =>
      [...queryKeys.games.all, 'edition', gameId, editionId] as const,
    editions: ['games', 'editions'] as const,
    social: {
      pins: (address: string) =>
        [...queryKeys.games.all, 'social', 'pins', address] as const,
      follows: (address: string) =>
        [...queryKeys.games.all, 'social', 'follows', address] as const,
      guilds: (guildId?: string) =>
        [...queryKeys.games.all, 'social', 'guilds', guildId] as const,
      alliances: (allianceId?: string) =>
        [...queryKeys.games.all, 'social', 'alliances', allianceId] as const,
    },
  },

  // Torii domain
  torii: {
    all: ['torii'] as const,
    client: (projectId: string) =>
      [...queryKeys.torii.all, 'client', projectId] as const,
    entities: (projectId: string, model: string) =>
      [...queryKeys.torii.all, 'entities', projectId, model] as const,
    subscription: (projectId: string, models: string[]) =>
      [...queryKeys.torii.all, 'subscription', projectId, models] as const,
  },
} as const;

// Type helpers for query keys
export type QueryKeyFactory = typeof queryKeys;
export type QueryKey<T extends (...args: any[]) => readonly unknown[]> = ReturnType<T>;
