import { useMemo, useCallback, useState, useEffect } from 'react';
import { useMetadataFilters } from './use-metadata-filters';
import { useMarketTokensFetcher } from './marketplace-tokens-fetcher';
import { useProject } from './project';
import { useSearchParams } from 'react-router-dom';

/**
 * Adapter hook that provides the same interface as useMarketFilters
 * but uses the new metadata filtering system
 */
export function useMetadataFiltersAdapter() {
  const { collection: collectionAddress, edition } = useProject();
  const [active, setActive] = useState(1); // 0 = Buy Now, 1 = Show All
  const [searchParams, setSearchParams] = useSearchParams();

  // Get tokens from the fetcher - use edition's project if available
  const { tokens } = useMarketTokensFetcher({
    project: edition ? [edition.config.project] : [],
    address: collectionAddress || ''
  });

  // Use the metadata filters hook
  const {
    filteredTokens,
    activeFilters,
    availableFilters,
    setFilter,
    removeFilter,
    clearAllFilters,
    metadataIndex
  } = useMetadataFilters({
    tokens: tokens || [],
    collectionAddress: collectionAddress || '',
    enabled: true
  });

  // Transform metadata index to the format expected by the filter component
  const allMetadata = useMemo(() => {
    const metadata: Array<{
      trait_type: string;
      value: string;
      tokens: Array<{ token_id: string }>;
    }> = [];

    for (const [trait, values] of Object.entries(metadataIndex)) {
      for (const [value, tokenIds] of Object.entries(values)) {
        metadata.push({
          trait_type: trait,
          value: value,
          tokens: tokenIds.map(id => ({ token_id: id }))
        });
      }
    }

    return metadata;
  }, [metadataIndex]);

  // Apply "Buy Now" vs "Show All" filter
  const tokensAfterStatusFilter = useMemo(() => {
    if (active === 0) {
      // Buy Now - only show tokens with orders
      return filteredTokens.filter(token => {
        // Check if token has orders (this would need to be integrated with marketplace data)
        // For now, return all filtered tokens
        // TODO: Integrate with marketplace orders
        return true;
      });
    } else {
      // Show All
      return filteredTokens;
    }
  }, [filteredTokens, active]);

  // Transform filtered data to the format expected by the filter component
  const filteredMetadata = useMemo(() => {
    const metadata: Array<{
      trait_type: string;
      value: string;
      tokens: Array<{ token_id: string }>;
    }> = [];

    // Get the set of filtered token IDs (after status filter)
    const filteredTokenIds = new Set(tokensAfterStatusFilter.map(t => t.token_id));

    for (const [trait, values] of Object.entries(metadataIndex)) {
      for (const [value, tokenIds] of Object.entries(values)) {
        // Only include token IDs that are in the filtered set
        const matchingIds = tokenIds.filter(id => filteredTokenIds.has(id));

        metadata.push({
          trait_type: trait,
          value: value,
          tokens: matchingIds.map(id => ({ token_id: id }))
        });
      }
    }

    return metadata;
  }, [metadataIndex, tokensAfterStatusFilter]);

  // Check if a filter is active
  const isActive = useCallback((trait: string, value: string) => {
    return activeFilters[trait]?.has(value) || false;
  }, [activeFilters]);

  // Add or remove a filter
  const addSelected = useCallback((trait: string, value: string, selected: boolean) => {
    if (selected) {
      setFilter(trait, value);
    } else {
      removeFilter(trait, value);
    }
  }, [setFilter, removeFilter]);

  // Reset all filters
  const resetSelected = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  // Check if any filters are active
  const clearable = useMemo(() => {
    return Object.keys(activeFilters).length > 0;
  }, [activeFilters]);

  // Check if filters result in empty state
  const empty = useMemo(() => {
    return Object.keys(activeFilters).length > 0 && tokensAfterStatusFilter.length === 0;
  }, [activeFilters, tokensAfterStatusFilter]);

  // Check if a specific filter is selected (for context compatibility)
  const isSelected = useCallback((attributes: Array<{ trait_type: string; value: string }>) => {
    for (const attr of attributes) {
      if (!activeFilters[attr.trait_type]?.has(attr.value)) {
        return false;
      }
    }
    return true;
  }, [activeFilters]);

  // Set all metadata (for context compatibility)
  const setAllMetadata = useCallback((metadata: any) => {
    // This is handled automatically by the metadata index
    console.log('setAllMetadata called but handled by metadata index');
  }, []);

  // Set filtered metadata (for context compatibility)
  const setFilteredMetadata = useCallback((metadata: any) => {
    // This is handled automatically by the filtering system
    console.log('setFilteredMetadata called but handled by filtering system');
  }, []);

  return {
    // Filter state
    active,
    setActive,

    // Metadata
    allMetadata,
    filteredMetadata,
    setAllMetadata,
    setFilteredMetadata,

    // Filter actions
    isActive,
    addSelected,
    isSelected,
    resetSelected,

    // Status
    clearable,
    empty,

    // Additional data from original hook
    tokens,
    filteredTokens: tokensAfterStatusFilter,
    activeFilters,
    availableFilters
  };
}
