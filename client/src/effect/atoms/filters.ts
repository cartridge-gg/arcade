import { Atom } from "@effect-atom/atom-react";
import type {
  ActiveFilters,
  CollectionFilterState,
  StatusFilter,
} from "@/types/metadata-filter.types";

export type FiltersState = Record<string, CollectionFilterState>;

export const DEFAULT_STATUS_FILTER: StatusFilter = "all";

export const filtersAtom = Atom.make<FiltersState>({});

export const cloneFilters = (filters: ActiveFilters): ActiveFilters => {
  return Object.fromEntries(
    Object.entries(filters).map(([trait, values]) => [trait, new Set(values)]),
  );
};

export const ensureCollectionState = (
  collections: FiltersState,
  collectionAddress: string,
): CollectionFilterState => {
  return (
    collections[collectionAddress] ?? {
      activeFilters: {},
      statusFilter: DEFAULT_STATUS_FILTER,
    }
  );
};
