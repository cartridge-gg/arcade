import type {
  ActiveFilters,
  AvailableFilters,
  PrecomputedFilterData,
  PrecomputedFilterProperty,
} from "@cartridge/arcade/marketplace";
import type { Token } from "@dojoengine/torii-wasm";

export type {
  ActiveFilters,
  AvailableFilters,
  PrecomputedFilterData,
  PrecomputedFilterProperty,
};

export type StatusFilter = "all" | "listed";

export interface UseMetadataFiltersInput {
  tokens: Token[];
  collectionAddress: string;
  enabled?: boolean;
}

export interface UseMetadataFiltersReturn {
  filteredTokens: Token[];
  activeFilters: ActiveFilters;
  availableFilters: AvailableFilters;
  precomputed: PrecomputedFilterData;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  setFilter: (trait: string, value: string) => void;
  removeFilter: (trait: string, value?: string) => void;
  clearAllFilters: () => void;
  isLoading: boolean;
  isEmpty: boolean;
}

export interface CollectionFilterState {
  activeFilters: ActiveFilters;
  statusFilter: StatusFilter;
}

export interface MetadataFilterStore {
  collections: Record<string, CollectionFilterState>;
  replaceFilters: (collectionAddress: string, filters: ActiveFilters) => void;
  toggleFilter: (
    collectionAddress: string,
    trait: string,
    value: string,
  ) => void;
  removeFilter: (
    collectionAddress: string,
    trait: string,
    value?: string,
  ) => void;
  clearFilters: (collectionAddress: string) => void;
  setStatusFilter: (collectionAddress: string, status: StatusFilter) => void;
  getCollectionState: (
    collectionAddress: string,
  ) => CollectionFilterState | undefined;
}
