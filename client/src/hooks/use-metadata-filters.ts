import { useCallback } from "react";
import {
  useFilterActions,
  useFilterData,
  useFilterUrlSync,
  useFilteredTokens,
} from "./filters";
import type {
  UseMetadataFiltersInput,
  UseMetadataFiltersReturn,
} from "@/types/metadata-filter.types";

export function useMetadataFilters({
  tokens,
  collectionAddress,
  enabled = true,
}: UseMetadataFiltersInput): UseMetadataFiltersReturn {
  const {
    replaceFilters,
    toggleFilter,
    removeFilter: actionsRemoveFilter,
    clearAllFilters,
    setStatusFilter,
  } = useFilterActions(collectionAddress);

  const { activeFilters, statusFilter, availableFilters, isMetadataLoading } =
    useFilterData(collectionAddress);

  useFilterUrlSync({
    collectionAddress,
    enabled,
    replaceFilters,
  });

  const { filteredTokens, precomputed, isEmpty } = useFilteredTokens({
    tokens,
    activeFilters,
    availableFilters,
    enabled,
  });

  const setFilter = useCallback(
    (trait: string, value: string) => {
      if (!enabled) return;
      if (activeFilters[trait]?.has(value)) return;
      toggleFilter(trait, value);
    },
    [activeFilters, enabled, toggleFilter],
  );

  const removeFilter = useCallback(
    (trait: string, value?: string) => {
      if (!enabled) return;
      if (!activeFilters[trait]) return;

      if (value === undefined) {
        if (activeFilters[trait].size === 0) return;
        actionsRemoveFilter(trait);
        return;
      }

      if (!activeFilters[trait].has(value)) return;
      actionsRemoveFilter(trait, value);
    },
    [activeFilters, enabled, actionsRemoveFilter],
  );

  const wrappedClearAllFilters = useCallback(() => {
    if (!enabled) return;
    clearAllFilters();
  }, [clearAllFilters, enabled]);

  return {
    filteredTokens,
    activeFilters,
    availableFilters,
    precomputed,
    statusFilter,
    setStatusFilter,
    setFilter,
    removeFilter,
    clearAllFilters: wrappedClearAllFilters,
    isLoading: isMetadataLoading,
    isEmpty,
  };
}
