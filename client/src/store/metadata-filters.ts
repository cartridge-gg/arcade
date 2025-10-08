import { create } from "zustand";
import type {
  ActiveFilters,
  CollectionFilterState,
  MetadataFilterStore,
  StatusFilter,
} from "@/types/metadata-filter.types";

const DEFAULT_STATUS_FILTER: StatusFilter = "all";

const cloneFilters = (filters: ActiveFilters): ActiveFilters => {
  return Object.fromEntries(
    Object.entries(filters).map(([trait, values]) => [trait, new Set(values)]),
  );
};

const ensureCollection = (
  collections: Record<string, CollectionFilterState>,
  collectionAddress: string,
): CollectionFilterState => {
  return (
    collections[collectionAddress] ?? {
      activeFilters: {},
      statusFilter: DEFAULT_STATUS_FILTER,
    }
  );
};

export const useMetadataFilterStore = create<MetadataFilterStore>(
  (set, get) => ({
    collections: {},

    replaceFilters: (collectionAddress, filters) =>
      set((state) => {
        const collection = ensureCollection(
          state.collections,
          collectionAddress,
        );
        return {
          collections: {
            ...state.collections,
            [collectionAddress]: {
              activeFilters: cloneFilters(filters),
              statusFilter: collection.statusFilter,
            },
          },
        };
      }),

    toggleFilter: (collectionAddress, trait, value) =>
      set((state) => {
        const collection = ensureCollection(
          state.collections,
          collectionAddress,
        );
        const nextFilters = cloneFilters(collection.activeFilters);
        const existing =
          nextFilters[trait] !== undefined
            ? new Set(nextFilters[trait])
            : new Set<string>();

        if (existing.has(value)) {
          existing.delete(value);
          if (existing.size === 0) {
            delete nextFilters[trait];
          } else {
            nextFilters[trait] = existing;
          }
        } else {
          existing.add(value);
          nextFilters[trait] = existing;
        }

        return {
          collections: {
            ...state.collections,
            [collectionAddress]: {
              activeFilters: nextFilters,
              statusFilter: collection.statusFilter,
            },
          },
        };
      }),

    removeFilter: (collectionAddress, trait, value) =>
      set((state) => {
        const collection = state.collections[collectionAddress];
        if (!collection) return state;

        const nextFilters = cloneFilters(collection.activeFilters);

        if (!nextFilters[trait]) {
          return state;
        }

        if (value === undefined) {
          delete nextFilters[trait];
        } else {
          const values = new Set(nextFilters[trait]);
          values.delete(value);
          if (values.size === 0) {
            delete nextFilters[trait];
          } else {
            nextFilters[trait] = values;
          }
        }

        return {
          collections: {
            ...state.collections,
            [collectionAddress]: {
              activeFilters: nextFilters,
              statusFilter: collection.statusFilter,
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
              activeFilters: {},
              statusFilter: collection.statusFilter,
            },
          },
        };
      }),

    setStatusFilter: (collectionAddress, status) =>
      set((state) => {
        const collection = ensureCollection(
          state.collections,
          collectionAddress,
        );
        return {
          collections: {
            ...state.collections,
            [collectionAddress]: {
              activeFilters: cloneFilters(collection.activeFilters),
              statusFilter: status,
            },
          },
        };
      }),

    getCollectionState: (collectionAddress) => {
      return get().collections[collectionAddress];
    },
  }),
);
