import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMetadataFilterStore } from '@/store/metadata-filters';
import {
  buildMetadataIndex,
  calculateFilterCounts,
  serializeFiltersToURL,
  parseFiltersFromURL
} from '@/utils/metadata-indexer';
import {
  UseMetadataFiltersInput,
  UseMetadataFiltersReturn,
  ActiveFilters
} from '@/types/metadata-filter.types';

export function useMetadataFilters({
  tokens,
  collectionAddress,
  enabled = true
}: UseMetadataFiltersInput): UseMetadataFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const {
    getCollectionState,
    setMetadataIndex,
    setActiveFilters,
    toggleFilter,
    removeFilter: storeRemoveFilter,
    clearFilters,
    updateAvailableFilters,
    getFilteredTokenIds
  } = useMetadataFilterStore();

  const collectionState = getCollectionState(collectionAddress);

  // Build metadata index when tokens change
  useEffect(() => {
    if (!enabled || !tokens || tokens.length === 0) return;

    setIsLoading(true);

    // Use requestIdleCallback for large collections to avoid blocking UI
    const buildIndex = () => {
      const index = buildMetadataIndex(tokens);
      setMetadataIndex(collectionAddress, index);
      setIsLoading(false);
    };

    if (tokens.length > 1000 && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(buildIndex);
      return () => window.cancelIdleCallback(handle);
    } else {
      buildIndex();
    }
  }, [tokens, collectionAddress, enabled, setMetadataIndex]);

  // Initialize filters from URL on mount - use ref to track if already initialized
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!enabled || hasInitialized.current) return;

    const filterParam = searchParams.get('filters');
    if (filterParam) {
      const parsedFilters = parseFiltersFromURL(filterParam);
      setActiveFilters(collectionAddress, parsedFilters);
    }
    hasInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionAddress, enabled]); // Only on mount/collection change - intentionally omit other deps

  // Get current state
  const metadataIndex = collectionState?.metadataIndex || {};
  const activeFilters = collectionState?.activeFilters || {};

  // Calculate filtered tokens
  const filteredTokens = useMemo(() => {
    if (!enabled || !tokens) return tokens || [];

    const filteredIds = getFilteredTokenIds(collectionAddress);
    if (filteredIds.length === 0 && Object.keys(activeFilters).length === 0) {
      // No filters active, return all tokens
      return tokens;
    }

    const idSet = new Set(filteredIds);
    return tokens.filter(token => token.token_id && idSet.has(token.token_id));
  }, [tokens, collectionAddress, activeFilters, enabled, getFilteredTokenIds]);

  // Calculate available filters with counts
  const availableFilters = useMemo(() => {
    if (!enabled || Object.keys(metadataIndex).length === 0) {
      return {};
    }

    if (Object.keys(activeFilters).length === 0) {
      // No filters active, show counts for all tokens
      return calculateFilterCounts(metadataIndex);
    } else {
      // Filters active, calculate filtered IDs directly to avoid dependency on filteredTokens
      const filteredIds = getFilteredTokenIds(collectionAddress);
      return calculateFilterCounts(metadataIndex, filteredIds);
    }
  }, [metadataIndex, activeFilters, collectionAddress, enabled, getFilteredTokenIds]);

  // Update available filters in store - use useRef to prevent infinite loops
  const prevAvailableFilters = useRef(availableFilters);
  useEffect(() => {
    if (JSON.stringify(prevAvailableFilters.current) !== JSON.stringify(availableFilters)) {
      prevAvailableFilters.current = availableFilters;
      updateAvailableFilters(collectionAddress, availableFilters);
    }
  }, [availableFilters, collectionAddress, updateAvailableFilters]);

  // Update URL when filters change - use useRef to track previous value
  const prevActiveFilters = useRef<ActiveFilters>({});
  useEffect(() => {
    if (!enabled) return;

    const currentFilterParam = searchParams.get('filters');
    const newFilterParam = serializeFiltersToURL(activeFilters);

    // Only update if filters actually changed (not just reference)
    if (JSON.stringify(prevActiveFilters.current) !== JSON.stringify(activeFilters)) {
      prevActiveFilters.current = activeFilters;

      if (currentFilterParam !== newFilterParam) {
        if (newFilterParam) {
          searchParams.set('filters', newFilterParam);
        } else {
          searchParams.delete('filters');
        }
        setSearchParams(searchParams, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, enabled]);

  // Action: Set filter
  const setFilter = useCallback(
    (trait: string, value: string) => {
      if (!enabled) return;
      toggleFilter(collectionAddress, trait, value);
    },
    [collectionAddress, enabled, toggleFilter]
  );

  // Action: Remove filter
  const removeFilter = useCallback(
    (trait: string, value?: string) => {
      if (!enabled) return;
      storeRemoveFilter(collectionAddress, trait, value);
    },
    [collectionAddress, enabled, storeRemoveFilter]
  );

  // Action: Clear all filters
  const clearAllFilters = useCallback(() => {
    if (!enabled) return;
    clearFilters(collectionAddress);
  }, [collectionAddress, enabled, clearFilters]);

  // Check if results are empty
  const isEmpty = filteredTokens.length === 0 && Object.keys(activeFilters).length > 0;

  return {
    filteredTokens,
    metadataIndex,
    activeFilters,
    availableFilters,
    setFilter,
    removeFilter,
    clearAllFilters,
    isLoading,
    isEmpty
  };
}
