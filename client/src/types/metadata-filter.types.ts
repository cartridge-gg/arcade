import type {
  ActiveFilters,
  AvailableFilters,
  PrecomputedFilterData,
  PrecomputedFilterProperty,
  TraitNameSummary,
} from "@cartridge/arcade/marketplace";
import type { Token } from "@dojoengine/torii-wasm";

export type {
  ActiveFilters,
  AvailableFilters,
  PrecomputedFilterData,
  PrecomputedFilterProperty,
  TraitNameSummary,
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
  traitSummary: TraitNameSummary[];
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  setFilter: (trait: string, value: string) => void;
  removeFilter: (trait: string, value?: string) => void;
  clearAllFilters: () => void;
  isLoading: boolean;
  isSummaryLoading: boolean;
  isEmpty: boolean;
  expandedTraits: Set<string>;
  expandTrait: (traitName: string) => void;
  collapseTrait: (traitName: string) => void;
}

export interface CollectionFilterState {
  activeFilters: ActiveFilters;
  statusFilter: StatusFilter;
  ownerFilter?: string;
  isPlayerAddress?: boolean;
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
