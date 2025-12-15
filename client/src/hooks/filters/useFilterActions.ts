import { useCallback } from "react";
import { useAtomSet } from "@effect-atom/atom-react";
import {
  filtersAtom,
  cloneFilters,
  ensureCollectionState,
} from "@/effect/atoms";
import type {
  ActiveFilters,
  StatusFilter,
} from "@/types/metadata-filter.types";

export interface UseFilterActionsReturn {
  replaceFilters: (filters: ActiveFilters) => void;
  toggleFilter: (trait: string, value: string) => void;
  removeFilter: (trait: string, value?: string) => void;
  clearAllFilters: () => void;
  setStatusFilter: (status: StatusFilter) => void;
  setOwnerFilter: (owner: string | undefined) => void;
}

export function useFilterActions(
  collectionAddress: string,
): UseFilterActionsReturn {
  const setFilters = useAtomSet(filtersAtom);

  const replaceFilters = useCallback(
    (filters: ActiveFilters) => {
      setFilters((state) => {
        const collection = ensureCollectionState(state, collectionAddress);
        return {
          ...state,
          [collectionAddress]: {
            ...collection,
            activeFilters: cloneFilters(filters),
          },
        };
      });
    },
    [collectionAddress, setFilters],
  );

  const toggleFilter = useCallback(
    (trait: string, value: string) => {
      setFilters((state) => {
        const collection = ensureCollectionState(state, collectionAddress);
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
          ...state,
          [collectionAddress]: {
            ...collection,
            activeFilters: nextFilters,
          },
        };
      });
    },
    [collectionAddress, setFilters],
  );

  const removeFilter = useCallback(
    (trait: string, value?: string) => {
      setFilters((state) => {
        const collection = state[collectionAddress];
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
          ...state,
          [collectionAddress]: {
            ...collection,
            activeFilters: nextFilters,
          },
        };
      });
    },
    [collectionAddress, setFilters],
  );

  const clearAllFilters = useCallback(() => {
    setFilters((state) => {
      const collection = state[collectionAddress];
      if (!collection) return state;

      return {
        ...state,
        [collectionAddress]: {
          ...collection,
          activeFilters: {},
        },
      };
    });
  }, [collectionAddress, setFilters]);

  const setStatusFilter = useCallback(
    (status: StatusFilter) => {
      setFilters((state) => {
        const collection = ensureCollectionState(state, collectionAddress);
        return {
          ...state,
          [collectionAddress]: {
            ...collection,
            statusFilter: status,
          },
        };
      });
    },
    [collectionAddress, setFilters],
  );

  const setOwnerFilter = useCallback(
    (owner: string | undefined) => {
      setFilters((state) => {
        const collection = ensureCollectionState(state, collectionAddress);
        return {
          ...state,
          [collectionAddress]: {
            ...collection,
            ownerFilter: owner,
          },
        };
      });
    },
    [collectionAddress, setFilters],
  );

  return {
    replaceFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    setStatusFilter,
    setOwnerFilter,
  };
}
