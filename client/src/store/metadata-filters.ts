import { create } from "zustand";
import type {
  MetadataFilterStore,
  StatusFilter,
} from "@/types/metadata-filter.types";
import { applyFilters, precomputeFilterData } from "@/utils/metadata-indexer";

const DEFAULT_STATUS_FILTER: StatusFilter = "all";

export const useMetadataFilterStore = create<MetadataFilterStore>(
  (set, get) => ({
    collections: {},

    setMetadataIndex: (collectionAddress, index) => {
      // Pre-compute filter data for performance
      const precomputed = precomputeFilterData(index);

      return set((state) => ({
        collections: {
          ...state.collections,
          [collectionAddress]: {
            ...(state.collections[collectionAddress] || {}),
            metadataIndex: index,
            precomputed, // Store pre-computed data
            activeFilters:
              state.collections[collectionAddress]?.activeFilters || {},
            availableFilters:
              state.collections[collectionAddress]?.availableFilters || {},
            statusFilter:
              state.collections[collectionAddress]?.statusFilter ||
              DEFAULT_STATUS_FILTER,
            lastUpdated: Date.now(),
          },
        },
      }));
    },

    setActiveFilters: (collectionAddress, filters) =>
      set((state) => ({
        collections: {
          ...state.collections,
          [collectionAddress]: {
            ...(state.collections[collectionAddress] || {
              metadataIndex: {},
              availableFilters: {},
              statusFilter: DEFAULT_STATUS_FILTER,
              lastUpdated: Date.now(),
            }),
            activeFilters: filters,
            lastUpdated: Date.now(),
          },
        },
      })),

    toggleFilter: (collectionAddress, trait, value) =>
      set((state) => {
        const collection = state.collections[collectionAddress];
        if (!collection) {
          // Initialize collection if it doesn't exist
          return {
            collections: {
              ...state.collections,
              [collectionAddress]: {
                metadataIndex: {},
                activeFilters: { [trait]: new Set([value]) },
                availableFilters: {},
                statusFilter: DEFAULT_STATUS_FILTER,
                lastUpdated: Date.now(),
              },
            },
          };
        }

        const currentFilters = { ...collection.activeFilters };

        if (!currentFilters[trait]) {
          currentFilters[trait] = new Set();
        } else {
          // Create a new Set to ensure immutability
          currentFilters[trait] = new Set(currentFilters[trait]);
        }

        if (currentFilters[trait].has(value)) {
          currentFilters[trait].delete(value);
          if (currentFilters[trait].size === 0) {
            delete currentFilters[trait];
          }
        } else {
          currentFilters[trait].add(value);
        }

        return {
          collections: {
            ...state.collections,
            [collectionAddress]: {
              ...collection,
              activeFilters: currentFilters,
              lastUpdated: Date.now(),
            },
          },
        };
      }),

    removeFilter: (collectionAddress, trait, value) =>
      set((state) => {
        const collection = state.collections[collectionAddress];
        if (!collection) return state;

        const currentFilters = { ...collection.activeFilters };

        if (!currentFilters[trait]) return state;

        if (value === undefined) {
          // Remove entire trait
          delete currentFilters[trait];
        } else {
          // Remove specific value
          currentFilters[trait] = new Set(currentFilters[trait]);
          currentFilters[trait].delete(value);

          if (currentFilters[trait].size === 0) {
            delete currentFilters[trait];
          }
        }

        return {
          collections: {
            ...state.collections,
            [collectionAddress]: {
              ...collection,
              activeFilters: currentFilters,
              lastUpdated: Date.now(),
            },
          },
        };
      }),

    clearFilters: (collectionAddress) =>
      set((state) => {
        const collection = state.collections[collectionAddress];
        if (!collection) return state;

        return {
          collections: {
            ...state.collections,
            [collectionAddress]: {
              ...collection,
              activeFilters: {},
              lastUpdated: Date.now(),
            },
          },
        };
      }),

    updateAvailableFilters: (collectionAddress, filters) =>
      set((state) => ({
        collections: {
          ...state.collections,
          [collectionAddress]: {
            ...(state.collections[collectionAddress] || {
              metadataIndex: {},
              activeFilters: {},
              statusFilter: DEFAULT_STATUS_FILTER,
              lastUpdated: Date.now(),
            }),
            availableFilters: filters,
            lastUpdated: Date.now(),
          },
        },
      })),

    setStatusFilter: (collectionAddress, status) =>
      set((state) => ({
        collections: {
          ...state.collections,
          [collectionAddress]: {
            ...(state.collections[collectionAddress] || {
              metadataIndex: {},
              activeFilters: {},
              availableFilters: {},
              precomputed: undefined,
              lastUpdated: Date.now(),
              statusFilter: DEFAULT_STATUS_FILTER,
            }),
            statusFilter: status,
            lastUpdated: Date.now(),
          },
        },
      })),

    getCollectionState: (collectionAddress) => {
      return get().collections[collectionAddress];
    },

    getActiveFilters: (collectionAddress) => {
      const collection = get().collections[collectionAddress];
      return collection?.activeFilters || {};
    },

    getFilteredTokenIds: (collectionAddress) => {
      const collection = get().collections[collectionAddress];
      if (!collection || !collection.metadataIndex) {
        return [];
      }

      return applyFilters(
        collection.metadataIndex,
        collection.activeFilters || {},
      );
    },

    getStatusFilter: (collectionAddress) => {
      const collection = get().collections[collectionAddress];
      return collection?.statusFilter || DEFAULT_STATUS_FILTER;
    },
  }),
);
