/**
 * Contract for useMetadataFilters hook
 * This hook manages NFT metadata filtering logic
 */

import { Token } from "@dojoengine/torii-wasm";

// Input types
export interface UseMetadataFiltersInput {
  tokens: Token[];                    // Array of tokens to filter
  collectionAddress: string;          // Collection contract address
  enabled?: boolean;                  // Enable/disable filtering
}

// Return types
export interface UseMetadataFiltersReturn {
  // State
  filteredTokens: Token[];            // Tokens after applying filters
  metadataIndex: MetadataIndex;       // Trait-value-tokenId mapping
  activeFilters: ActiveFilters;       // Currently selected filters
  availableFilters: AvailableFilters; // All possible filters with counts

  // Actions
  setFilter: (trait: string, value: string) => void;      // Add/toggle a filter
  removeFilter: (trait: string, value?: string) => void;  // Remove filter(s)
  clearAllFilters: () => void;                           // Reset all filters

  // Status
  isLoading: boolean;                 // Index building in progress
  isEmpty: boolean;                   // No tokens match current filters
}

// Supporting types
export interface MetadataIndex {
  [trait: string]: {
    [value: string]: string[];        // Array of token IDs
  };
}

export interface ActiveFilters {
  [trait: string]: Set<string>;       // Selected values per trait
}

export interface AvailableFilters {
  [trait: string]: {
    [value: string]: number;          // Count of tokens
  };
}

// Hook contract
export type UseMetadataFilters = (
  input: UseMetadataFiltersInput
) => UseMetadataFiltersReturn;