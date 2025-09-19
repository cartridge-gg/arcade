/**
 * Contract for Metadata Filter Store
 * Zustand store interface for managing filter state
 */

// Store state
export interface MetadataFilterStore {
  // State by collection
  collections: {
    [collectionAddress: string]: CollectionFilterState;
  };

  // Actions
  setMetadataIndex: (
    collectionAddress: string,
    index: MetadataIndex
  ) => void;

  setActiveFilters: (
    collectionAddress: string,
    filters: ActiveFilters
  ) => void;

  toggleFilter: (
    collectionAddress: string,
    trait: string,
    value: string
  ) => void;

  removeFilter: (
    collectionAddress: string,
    trait: string,
    value?: string
  ) => void;

  clearFilters: (collectionAddress: string) => void;

  updateAvailableFilters: (
    collectionAddress: string,
    filters: AvailableFilters
  ) => void;

  // Selectors
  getCollectionState: (
    collectionAddress: string
  ) => CollectionFilterState | undefined;

  getActiveFilters: (
    collectionAddress: string
  ) => ActiveFilters;

  getFilteredTokenIds: (
    collectionAddress: string
  ) => string[];
}

// Collection-specific state
export interface CollectionFilterState {
  metadataIndex: MetadataIndex;
  activeFilters: ActiveFilters;
  availableFilters: AvailableFilters;
  lastUpdated: number; // Timestamp
}

// Reuse types from hook contract
export interface MetadataIndex {
  [trait: string]: {
    [value: string]: string[];
  };
}

export interface ActiveFilters {
  [trait: string]: Set<string>;
}

export interface AvailableFilters {
  [trait: string]: {
    [value: string]: number;
  };
}