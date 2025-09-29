import { Token } from "@dojoengine/torii-wasm";

// Core metadata structures
export interface MetadataIndex {
  [trait: string]: {
    [value: string]: string[]; // Array of token IDs
  };
}

export interface TokenAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface TokenMetadata {
  name?: string;
  image?: string;
  attributes?: TokenAttribute[];
}

// Filter state management
export interface ActiveFilters {
  [trait: string]: Set<string>; // Selected values per trait
}

export interface AvailableFilters {
  [trait: string]: {
    [value: string]: number; // Count of tokens with this trait-value
  };
}

// Pre-computed filter data for performance
export interface PrecomputedProperty {
  property: string;
  order: number; // Total count across all tokens
}

export interface PrecomputedFilterData {
  attributes: string[]; // Sorted list of unique traits
  properties: {
    [trait: string]: PrecomputedProperty[]; // Sorted properties with counts
  };
  // Pre-computed metadata format for UI
  allMetadata: Array<{
    trait_type: string;
    value: string;
    tokens: Array<{ token_id: string }>;
  }>;
}

export interface FilterState {
  activeFilters: ActiveFilters;
  availableFilters: AvailableFilters;
}

export interface CollectionFilterState extends FilterState {
  metadataIndex: MetadataIndex;
  precomputed?: PrecomputedFilterData; // Optional for backward compatibility
  lastUpdated: number;
}

// Hook interfaces
export interface UseMetadataFiltersInput {
  tokens: Token[];
  collectionAddress: string;
  enabled?: boolean;
}

export interface UseMetadataFiltersReturn {
  // State
  filteredTokens: Token[];
  metadataIndex: MetadataIndex;
  activeFilters: ActiveFilters;
  availableFilters: AvailableFilters;

  // Actions
  setFilter: (trait: string, value: string) => void;
  removeFilter: (trait: string, value?: string) => void;
  clearAllFilters: () => void;

  // Status
  isLoading: boolean;
  isEmpty: boolean;
}

// Store interface
export interface MetadataFilterStore {
  collections: {
    [collectionAddress: string]: CollectionFilterState;
  };

  // Actions
  setMetadataIndex: (collectionAddress: string, index: MetadataIndex) => void;
  setActiveFilters: (collectionAddress: string, filters: ActiveFilters) => void;
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
  updateAvailableFilters: (
    collectionAddress: string,
    filters: AvailableFilters,
  ) => void;

  // Selectors
  getCollectionState: (
    collectionAddress: string,
  ) => CollectionFilterState | undefined;
  getActiveFilters: (collectionAddress: string) => ActiveFilters;
  getFilteredTokenIds: (collectionAddress: string) => string[];
}

// URL serialization
export interface FilterURLParams {
  filters?: string; // Format: "trait1:value1,value2|trait2:value3"
}

// Utility function types
export type BuildMetadataIndex = (tokens: Token[]) => MetadataIndex;
export type UpdateMetadataIndex = (
  existingIndex: MetadataIndex,
  newTokens: Token[],
) => MetadataIndex;
export type ExtractTokenAttributes = (token: Token) => TokenAttribute[];
export type CalculateFilterCounts = (
  metadataIndex: MetadataIndex,
  tokenIds?: string[],
) => AvailableFilters;
export type ApplyFilters = (
  metadataIndex: MetadataIndex,
  activeFilters: ActiveFilters,
) => string[];
export type SerializeFiltersToURL = (filters: ActiveFilters) => string;
export type ParseFiltersFromURL = (urlParams: string) => ActiveFilters;
