import { useMemo, useCallback, useState } from 'react';
import { useMetadataFilters } from './use-metadata-filters';
import { useMarketTokensFetcher } from './marketplace-tokens-fetcher';
import { useProject } from './project';
import { useSearchParams } from 'react-router-dom';
import { useMetadataFilterStore } from '@/store/metadata-filters';
import { useMarketplace } from './marketplace';

/**
 * Adapter hook that provides the same interface as useMarketFilters
 * but uses the new metadata filtering system
 */
export function useMetadataFiltersAdapter() {
  const { collection: collectionAddress, edition } = useProject();
  const [active, setActive] = useState(1); // 0 = Buy Now, 1 = Show All
  const [collectionSearch, setCollectionSearch] = useState<string>(''); // Collection search state
  const [, ] = useSearchParams();
  const { getCollectionOrders } = useMarketplace();

  // Get tokens from the fetcher - use edition's project if available
  const { tokens } = useMarketTokensFetcher({
    project: edition ? [edition.config.project] : [],
    address: collectionAddress || ''
  });

  // Get marketplace orders for this collection
  const collectionOrders = useMemo(() => {
    return getCollectionOrders(collectionAddress || '');
  }, [getCollectionOrders, collectionAddress]);

  // Use the metadata filters hook
  const {
    filteredTokens,
    activeFilters,
    availableFilters,
    setFilter,
    removeFilter,
    clearAllFilters
  } = useMetadataFilters({
    tokens: tokens || [],
    collectionAddress: collectionAddress || '',
    enabled: true
  });

  // Get pre-computed data from store
  const { getCollectionState } = useMetadataFilterStore();
  const collectionState = getCollectionState(collectionAddress || '');
  const precomputed = collectionState?.precomputed;

  // Use pre-computed allMetadata or fallback to empty array
  const allMetadata = useMemo(() => {
    return precomputed?.allMetadata || [];
  }, [precomputed]);

  // Apply "Buy Now" vs "Show All" filter
  const tokensAfterStatusFilter = useMemo(() => {
    if (active === 1) {
      return filteredTokens;
    }
    // Buy Now - only show tokens with orders
    return filteredTokens.filter((token) => {
      const tokenId = token.token_id?.toString();
      if (!tokenId) return false;
      const tokenOrders = collectionOrders[parseInt(tokenId)];
      return !!(tokenOrders && tokenOrders.length > 0);
    });
  }, [filteredTokens, active, collectionOrders]);

  // Apply collection search on top of status filter
  const tokensAfterSearch = useMemo(() => {
    if (!collectionSearch.trim()) return tokensAfterStatusFilter;

    const searchLower = collectionSearch.toLowerCase();

    return tokensAfterStatusFilter.filter(token => {
      const tokenName = (token.metadata as unknown as { name: string })?.name || token.name || '';
      return tokenName.toLowerCase().includes(searchLower);
    });
  }, [tokensAfterStatusFilter, collectionSearch]);

  // Calculate filtered metadata based on active tokens
  const filteredMetadata = useMemo(() => {
    if (!precomputed?.allMetadata) return [];

    // Get the set of filtered token IDs (after status filter and search)
    const filteredTokenIds = new Set(tokensAfterSearch.map(t => t.token_id));

    // Filter pre-computed metadata to only include tokens in filtered set
    return precomputed.allMetadata.map(item => ({
      ...item,
      tokens: item.tokens.filter(t => filteredTokenIds.has(t.token_id))
    }));
  }, [precomputed, tokensAfterSearch]);

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
    setCollectionSearch('');
  }, [clearAllFilters, setCollectionSearch]);

  // Check if any filters are active
  const clearable = useMemo(() => {
    return Object.keys(activeFilters).length > 0 || collectionSearch.trim().length > 0;
  }, [activeFilters, collectionSearch]);

  // Check if filters result in empty state
  const empty = useMemo(() => {
    return (Object.keys(activeFilters).length > 0 || collectionSearch.trim()) && tokensAfterSearch.length === 0;
  }, [activeFilters, collectionSearch, tokensAfterSearch]);

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
  const setAllMetadata = useCallback(() => {
    // This is handled automatically by the metadata index
    console.log('setAllMetadata called but handled by metadata index');
  }, []);

  // Set filtered metadata (for context compatibility)
  const setFilteredMetadata = useCallback(() => {
    // This is handled automatically by the filtering system
    console.log('setFilteredMetadata called but handled by filtering system');
  }, []);

  return {
    // Filter state
    active,
    setActive,

    // Collection search
    collectionSearch,
    setCollectionSearch,

    // Metadata
    allMetadata,
    filteredMetadata,
    setAllMetadata,
    setFilteredMetadata,

    // Pre-computed data for performance
    precomputedAttributes: precomputed?.attributes || [],
    precomputedProperties: precomputed?.properties || {},

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
    filteredTokens: tokensAfterSearch, // Use final filtered tokens (after search)
    activeFilters,
    availableFilters
  };
}
