import { create } from "zustand";
import { Discover } from "./hooks/discovers-fetcher";
import { Token } from "@dojoengine/torii-wasm";

type State = {
  events: { [project: string]: Discover[] };
};
type Actions = {
  addEvents: (events: { [project: string]: Discover[] }) => void;
  getAllEvents: (editions: string[]) => Discover[];
  getFollowingEvents: (editions: string[], addr: string[]) => Discover[];
};

export const useEventStore = create<State & Actions>((set, get) => ({
  events: {},
  addEvents: (evts) =>
    set(() => {
      const events = get().events;
      for (const [project, discovers] of Object.entries(evts)) {
        events[project] = discovers;
      }
      return {
        events,
      };
    }),
  getAllEvents: (editions: string[]) => {
    const events = get().events;
    return Object.values(events)
      .flatMap((e) => e)
      .filter((e) => e.name !== undefined && editions.includes(e.project))
      .sort((a, b) => b.timestamp - a.timestamp);
  },
  getFollowingEvents: (editions: string[], addr: string[]) => {
    const events = get().getAllEvents(editions);
    return events.filter((e) => addr.includes(e.address));
  },
}));

export type MarketplaceCollection = Token & { count: number; project: string };

export type Contract = {
  project: string;
  image: string;
  contract_address: string;
  contract_type: string;
  decimals: number;
  id: string;
  metadata: string;
  name: string;
  symbol: string;
  // hex string 
  token_id: string | null
  // hex string
  total_supply: string;
  totalSupply: bigint;
  // time as string
  created_at: string
  updated_at: "2025-09-15 13:46:13"
}

type MarketplaceState = {
  collections: { [project: string]: { [address: string]: Contract } };
};

type MarketplaceActions = {
  addCollections: (collections: { [project: string]: { [address: string]: Contract } }) => void;
  getAllCollections: (projects?: string[]) => { [project: string]: { [address: string]: Contract } };
  getProjectCollections: (project: string) => { [address: string]: Contract };
  clearCollections: () => void;
  getFlattenCollections: (projects: string[]) => Contract[]
};

export const useMarketplaceStore = create<MarketplaceState & MarketplaceActions>((set, get) => ({
  collections: {},
  addCollections: (newCollections) =>
    set((state) => {
      const collections = { ...state.collections };

      for (const [project, projectCollections] of Object.entries(newCollections)) {
        // Ensure we have a new object for this project
        if (!collections[project]) {
          collections[project] = {};
        } else {
          // Create a new object to avoid mutation
          collections[project] = { ...collections[project] };
        }

        // Merge collections at the address level
        for (const [address, newCollection] of Object.entries(projectCollections)) {
          const existingCollection = collections[project][address];

          if (existingCollection) {
            // Merge the collection, incrementing the count
            collections[project][address] = {
              ...newCollection,
              // Keep the larger total supply if both exist
              total_supply: newCollection.total_supply || existingCollection.total_supply,
              totalSupply: newCollection.totalSupply > 0n ? newCollection.totalSupply : existingCollection.totalSupply,
            };
          } else {
            // Add new collection
            collections[project][address] = newCollection;
          }
        }
      }

      return { collections };
    }),
  getAllCollections: (projects) => {
    const collections = get().collections;
    if (!projects) return collections;
    return Object.fromEntries(
      Object.entries(collections).filter(([project]) => projects.includes(project))
    );
  },
  getProjectCollections: (project) => {
    return get().collections[project] || {};
  },
  clearCollections: () => set({ collections: {} }),
  getFlattenCollections: (projects: string[]) => {
    const collections = get().getAllCollections(projects);
    return Object.entries(collections).flatMap(([, c]) => Object.values(c))
  }
}));

export type MarketplaceToken = Token & {
  project: string;
  owner: string;
  price?: string;
  listed?: boolean;
  image?: string;
};

type MarketplaceTokensState = {
  tokens: {
    [project: string]: {
      [collectionAddress: string]: Token[];
    };
  };
  loadingState: {
    [key: string]: {
      isLoading: boolean;
      hasMore: boolean;
      offset: number;
      total: number;
    };
  };
};

type MarketplaceTokensActions = {
  addTokens: (project: string, tokens: { [address: string]: Token[] }) => void;
  getTokens: (project: string, address: string) => Token[];
};

export const useMarketplaceTokensStore = create<MarketplaceTokensState & MarketplaceTokensActions>((set, get) => ({
  tokens: {},
  loadingState: {},
  addTokens: (project, newTokens) => set((state) => {
    const existingTokens = { ...state.tokens };

    // Initialize project if it doesn't exist
    if (!existingTokens[project]) {
      existingTokens[project] = {};
    }

    // Process each collection
    for (const [collectionAddress, tokens] of Object.entries(newTokens)) {
      if (!existingTokens[project][collectionAddress]) {
        existingTokens[project][collectionAddress] = []
      }
      // Merge with existing tokens for this collection
      const t = existingTokens[project][collectionAddress];

      existingTokens[project][collectionAddress] = [...t, ...tokens];
    }

    return { tokens: existingTokens };
  }),
  getTokens: (project, address) => {
    const projectTokens = get().tokens[project];
    if (!projectTokens) return [];
    return projectTokens[address] || [];
  },
}));
