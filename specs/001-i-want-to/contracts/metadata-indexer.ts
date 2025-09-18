/**
 * Contract for Metadata Indexing Utilities
 * Functions for processing NFT metadata into filterable index
 */

import { Token } from "@dojoengine/torii-wasm";

// Main indexing function
export type BuildMetadataIndex = (
  tokens: Token[]
) => MetadataIndex;

// Incremental update function
export type UpdateMetadataIndex = (
  existingIndex: MetadataIndex,
  newTokens: Token[]
) => MetadataIndex;

// Extract attributes from token
export type ExtractTokenAttributes = (
  token: Token
) => TokenAttribute[];

// Calculate filter counts
export type CalculateFilterCounts = (
  metadataIndex: MetadataIndex,
  tokenIds?: string[]
) => AvailableFilters;

// Apply filters to get matching tokens
export type ApplyFilters = (
  metadataIndex: MetadataIndex,
  activeFilters: ActiveFilters
) => string[];

// URL serialization
export type SerializeFiltersToURL = (
  filters: ActiveFilters
) => string;

// URL deserialization
export type ParseFiltersFromURL = (
  urlParams: string
) => ActiveFilters;

// Supporting types
export interface MetadataIndex {
  [trait: string]: {
    [value: string]: string[];
  };
}

export interface TokenAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface ActiveFilters {
  [trait: string]: Set<string>;
}

export interface AvailableFilters {
  [trait: string]: {
    [value: string]: number;
  };
}

// Utility function signatures
export interface MetadataIndexerUtils {
  buildMetadataIndex: BuildMetadataIndex;
  updateMetadataIndex: UpdateMetadataIndex;
  extractTokenAttributes: ExtractTokenAttributes;
  calculateFilterCounts: CalculateFilterCounts;
  applyFilters: ApplyFilters;
  serializeFiltersToURL: SerializeFiltersToURL;
  parseFiltersFromURL: ParseFiltersFromURL;
}