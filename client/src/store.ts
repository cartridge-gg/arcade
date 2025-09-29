import { create } from "zustand";
import { Token } from "@dojoengine/torii-wasm";

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
  token_id: string | null;
  // hex string
  total_supply: string;
  totalSupply: bigint;
  // time as string
  created_at: string;
  updated_at: "2025-09-15 13:46:13";
};

type MarketplaceState = {
  collections: { [project: string]: { [address: string]: Contract } };
};

type MarketplaceActions = {
  addCollections: (collections: {
    [project: string]: { [address: string]: Contract };
  }) => void;
  getAllCollections: (projects?: string[]) => {
    [project: string]: { [address: string]: Contract };
  };
  getProjectCollections: (project: string) => { [address: string]: Contract };
  clearCollections: () => void;
  getFlattenCollections: (projects: string[]) => Contract[];
};

export const useMarketplaceStore = create<
  MarketplaceState & MarketplaceActions
>((set, get) => ({
  collections: {},
  addCollections: (newCollections) =>
    set((state) => {
      const collections = { ...state.collections };

      for (const [project, projectCollections] of Object.entries(
        newCollections,
      )) {
        // Ensure we have a new object for this project
        if (!collections[project]) {
          collections[project] = {};
        } else {
          // Create a new object to avoid mutation
          collections[project] = { ...collections[project] };
        }

        // Merge collections at the address level
        for (const [address, newCollection] of Object.entries(
          projectCollections,
        )) {
          const existingCollection = collections[project][address];

          if (existingCollection) {
            // Merge the collection, incrementing the count
            collections[project][address] = {
              ...newCollection,
              // Keep the larger total supply if both exist
              total_supply:
                newCollection.total_supply || existingCollection.total_supply,
              totalSupply:
                newCollection.totalSupply > 0n
                  ? newCollection.totalSupply
                  : existingCollection.totalSupply,
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
      Object.entries(collections).filter(([project]) =>
        projects.includes(project),
      ),
    );
  },
  getProjectCollections: (project) => {
    return get().collections[project] || {};
  },
  clearCollections: () => set({ collections: {} }),
  getFlattenCollections: (projects: string[]) => {
    const collections = get().getAllCollections(projects);
    return Object.entries(collections)
      .flatMap(([, c]) => Object.values(c))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
}));

export type MarketplaceToken = Token & {
  project: string;
  owner: string;
  price?: string;
  listed?: boolean;
  image?: string;
};

type CollectionLoadingState = {
  isLoading: boolean;
  isComplete: boolean;
  lastCursor: string | null;
  lastFetchTime: number;
  totalCount?: number;
};

type MarketplaceTokensState = {
  tokens: {
    [project: string]: {
      [collectionAddress: string]: Token[];
    };
  };
  owners: {
    [project: string]: {
      [collectionAddress: string]: {
        [ownerAddress: string]: {
          balance: number;
          token_ids: string[];
          username?: string;
        };
      };
    };
  };
  loadingState: {
    [key: string]: CollectionLoadingState;
  };
};

type MarketplaceTokensActions = {
  addTokens: (project: string, tokens: { [address: string]: Token[] }) => void;
  getTokens: (project: string, address: string) => Token[];
  updateLoadingState: (
    project: string,
    address: string,
    state: Partial<CollectionLoadingState>,
  ) => void;
  getLoadingState: (
    project: string,
    address: string,
  ) => CollectionLoadingState | null;
  clearTokens: (project: string, address: string) => void;
  getOwners: (
    project: string,
    address: string,
  ) => Array<{
    address: string;
    balance: number;
    ratio: number;
    token_ids: string[];
    username?: string;
  }>;
};

export const useMarketplaceTokensStore = create<
  MarketplaceTokensState & MarketplaceTokensActions
>((set, get) => ({
  tokens: {},
  owners: {},
  loadingState: {},
  addTokens: (project, newTokens) =>
    set((state) => {
      const existingTokens = { ...state.tokens };

      // Initialize project if it doesn't exist
      if (!existingTokens[project]) {
        existingTokens[project] = {};
      }

      // Process each collection
      for (const [collectionAddress, tokens] of Object.entries(newTokens)) {
        if (!existingTokens[project][collectionAddress]) {
          existingTokens[project][collectionAddress] = [];
        }
        // Merge with existing tokens for this collection
        const t = existingTokens[project][collectionAddress];

        // Avoid duplicates by checking token IDs
        const existingIds = new Set(t.map((token) => token.token_id));
        const newUniqueTokens = tokens.filter(
          (token) => !existingIds.has(token.token_id),
        );

        existingTokens[project][collectionAddress] = [...t, ...newUniqueTokens];
      }

      return { tokens: existingTokens };
    }),
  getTokens: (project, address) => {
    const projectTokens = get().tokens[project];
    if (!projectTokens) return [];
    return projectTokens[address] || [];
  },
  updateLoadingState: (project, address, state) =>
    set((prevState) => {
      const key = `${project}_${address}`;
      const currentState = prevState.loadingState[key] || {
        isLoading: false,
        isComplete: false,
        lastCursor: null,
        lastFetchTime: 0,
      };

      return {
        loadingState: {
          ...prevState.loadingState,
          [key]: {
            ...currentState,
            ...state,
          },
        },
      };
    }),
  getLoadingState: (project, address) => {
    const key = `${project}_${address}`;
    return get().loadingState[key] || null;
  },
  clearTokens: (project, address) =>
    set((state) => {
      const tokens = { ...state.tokens };
      const owners = { ...state.owners };
      const loadingState = { ...state.loadingState };
      const key = `${project}_${address}`;

      if (tokens[project] && tokens[project][address]) {
        delete tokens[project][address];
      }

      if (owners[project] && owners[project][address]) {
        delete owners[project][address];
      }

      if (loadingState[key]) {
        delete loadingState[key];
      }

      return { tokens, owners, loadingState };
    }),
  getOwners: (project, address) => {
    const projectOwners = get().owners[project];
    if (!projectOwners || !projectOwners[address]) return [];

    const ownersObj = projectOwners[address];

    // Calculate total balance for ratio computation
    const totalBalance = Object.values(ownersObj).reduce(
      (sum, owner) => sum + owner.balance,
      0,
    );

    // Convert to array, calculate ratios, and sort by balance descending
    const ownersArray = Object.entries(ownersObj).map(
      ([ownerAddress, data]) => ({
        address: ownerAddress,
        balance: data.balance,
        ratio:
          totalBalance > 0
            ? Math.round((data.balance / totalBalance) * 1000) / 10
            : 0,
        token_ids: data.token_ids,
        username: data.username,
      }),
    );

    return ownersArray.sort((a, b) => b.balance - a.balance);
  },
}));
