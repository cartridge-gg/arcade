import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  buildAvailableFilters,
  buildPrecomputedFilters,
  filterTokensByMetadata,
  flattenActiveFilters,
} from "@cartridge/arcade/marketplace";
import { useMetadataFilterStore } from "@/store/metadata-filters";
import { useMetadata } from "@/queries";
import {
  parseFiltersFromURL,
  serializeFiltersToURL,
} from "@/utils/marketplace-filters";
import type {
  StatusFilter,
  UseMetadataFiltersInput,
  UseMetadataFiltersReturn,
} from "@/types/metadata-filter.types";

const DEFAULT_STATUS_FILTER: StatusFilter = "all";

export function useMetadataFilters({
  tokens,
  collectionAddress,
  enabled = true,
}: UseMetadataFiltersInput): UseMetadataFiltersReturn {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const searchParams = useMemo(
    () => new URLSearchParams(location.searchStr ?? ""),
    [location.searchStr],
  );

  const {
    collections,
    replaceFilters,
    toggleFilter,
    removeFilter: storeRemoveFilter,
    clearFilters,
    setStatusFilter: storeSetStatusFilter,
  } = useMetadataFilterStore();

  const collectionState = collections[collectionAddress];
  const activeFilters = collectionState?.activeFilters ?? {};
  const statusFilter = collectionState?.statusFilter ?? DEFAULT_STATUS_FILTER;

  const hasSyncedFromURL = useRef(false);

  useEffect(() => {
    if (!enabled || hasSyncedFromURL.current) return;

    const filterParam = searchParams.get("filters");

    if (filterParam) {
      const parsedFilters = parseFiltersFromURL(filterParam);
      replaceFilters(collectionAddress, parsedFilters);
    } else if (!collectionState) {
      replaceFilters(collectionAddress, {});
    }

    hasSyncedFromURL.current = true;
  }, [
    collectionAddress,
    collectionState,
    enabled,
    replaceFilters,
    searchParams,
  ]);

  const prevSerializedFilters = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!hasSyncedFromURL.current) return;

    const serialized = serializeFiltersToURL(activeFilters);
    if (prevSerializedFilters.current === serialized) return;

    prevSerializedFilters.current = serialized;

    const nextParams = new URLSearchParams(location.searchStr ?? "");

    if (serialized) {
      nextParams.set("filters", serialized);
    } else {
      nextParams.delete("filters");
    }

    const payload: Record<string, string> = {};
    nextParams.forEach((value, key) => {
      if (value) {
        payload[key] = value;
      }
    });

    navigate({
      to: location.pathname,
      search: payload,
      replace: true,
    });
  }, [activeFilters, enabled, navigate, location.pathname, location.searchStr]);

  const selectedTraits = useMemo(
    () => flattenActiveFilters(activeFilters),
    [activeFilters],
  );

  const metadataQuery = useMetadata({
    contractAddress: collectionAddress,
    traits: selectedTraits,
    enabled: enabled && !!collectionAddress,
  });

  const metadata = Array.isArray(metadataQuery.data) ? metadataQuery.data : [];

  const availableFilters = useMemo(
    () => buildAvailableFilters(metadata, activeFilters),
    [metadata, activeFilters],
  );

  const precomputed = useMemo(() => {
    return buildPrecomputedFilters(availableFilters);
  }, [availableFilters]);

  const filteredTokens = useMemo(() => {
    if (!enabled) {
      return tokens;
    }

    if (!tokens || tokens.length === 0) {
      return tokens;
    }

    if (Object.keys(activeFilters).length === 0) {
      return tokens;
    }

    return filterTokensByMetadata(tokens, activeFilters);
  }, [tokens, activeFilters, enabled]);

  const setFilter = useCallback(
    (trait: string, value: string) => {
      if (!enabled) return;
      if (activeFilters[trait]?.has(value)) return;
      toggleFilter(collectionAddress, trait, value);
    },
    [activeFilters, collectionAddress, enabled, toggleFilter],
  );

  const removeFilter = useCallback(
    (trait: string, value?: string) => {
      if (!enabled) return;
      if (!activeFilters[trait]) return;

      if (value === undefined) {
        if (activeFilters[trait].size === 0) return;
        storeRemoveFilter(collectionAddress, trait);
        return;
      }

      if (!activeFilters[trait].has(value)) return;
      storeRemoveFilter(collectionAddress, trait, value);
    },
    [activeFilters, collectionAddress, enabled, storeRemoveFilter],
  );

  const clearAllFilters = useCallback(() => {
    if (!enabled) return;
    clearFilters(collectionAddress);
  }, [clearFilters, collectionAddress, enabled]);

  const setStatusFilter = useCallback(
    (status: StatusFilter) => {
      storeSetStatusFilter(collectionAddress, status);
    },
    [collectionAddress, storeSetStatusFilter],
  );

  const isEmpty =
    filteredTokens.length === 0 && Object.keys(activeFilters).length > 0;

  const isLoading = metadataQuery.isLoading || metadataQuery.isFetching;

  return {
    filteredTokens,
    activeFilters,
    availableFilters,
    precomputed,
    statusFilter,
    setStatusFilter,
    setFilter,
    removeFilter,
    clearAllFilters,
    isLoading,
    isEmpty,
  };
}
