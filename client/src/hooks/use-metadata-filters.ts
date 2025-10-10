import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useMetadataFilterStore } from "@/store/metadata-filters";
import { useMetadata } from "@/queries";
import {
  parseFiltersFromURL,
  serializeFiltersToURL,
} from "@/utils/marketplace-filters";
import type {
  ActiveFilters,
  AvailableFilters,
  PrecomputedFilterData,
  StatusFilter,
  UseMetadataFiltersInput,
  UseMetadataFiltersReturn,
} from "@/types/metadata-filter.types";

const DEFAULT_STATUS_FILTER: StatusFilter = "all";

const tokenMatchesFilters = (
  token: UseMetadataFiltersInput["tokens"][number],
  activeFilters: ActiveFilters,
) => {
  const entries = Object.entries(activeFilters);
  if (entries.length === 0) {
    return true;
  }

  const metadata =
    typeof token.metadata === "string"
      ? (() => {
          try {
            return JSON.parse(token.metadata as unknown as string);
          } catch {
            return null;
          }
        })()
      : token.metadata;

  const attributes = Array.isArray((metadata as any)?.attributes)
    ? (metadata as any).attributes
    : [];

  if (!attributes.length) {
    return false;
  }

  const traitMap = new Map<string, Set<string>>();

  for (const attribute of attributes) {
    if (
      !attribute ||
      !attribute.trait_type ||
      attribute.value === undefined ||
      attribute.value === null
    ) {
      continue;
    }

    const trait = attribute.trait_type as string;
    const value = String(attribute.value);

    if (!traitMap.has(trait)) {
      traitMap.set(trait, new Set());
    }

    traitMap.get(trait)!.add(value);
  }

  for (const [trait, values] of entries) {
    const availableValues = traitMap.get(trait);
    if (!availableValues) {
      return false;
    }

    let matches = false;
    for (const value of values) {
      if (availableValues.has(value)) {
        matches = true;
        break;
      }
    }

    if (!matches) {
      return false;
    }
  }

  return true;
};

const buildAvailableFilters = (
  metadata: Array<{ traitName: string; traitValue: string; count: number }>,
  activeFilters: ActiveFilters,
): AvailableFilters => {
  const result: AvailableFilters = {};

  for (const entry of metadata) {
    const trait = entry.traitName;
    const value = entry.traitValue;

    if (!trait || value === undefined || value === null) continue;

    if (!result[trait]) {
      result[trait] = {};
    }

    result[trait][value] = entry.count;
  }

  for (const [trait, values] of Object.entries(activeFilters)) {
    if (!result[trait]) {
      result[trait] = {};
    }

    for (const value of values) {
      if (result[trait][value] === undefined) {
        result[trait][value] = 0;
      }
    }
  }

  return result;
};

const buildPrecomputed = (
  availableFilters: AvailableFilters,
): PrecomputedFilterData => {
  const attributes = Object.keys(availableFilters).sort((a, b) =>
    a.localeCompare(b),
  );

  const properties = attributes.reduce<PrecomputedFilterData["properties"]>(
    (acc, attribute) => {
      const entries = Object.entries(availableFilters[attribute] ?? {}).map(
        ([value, count]) => ({
          property: value,
          order: count,
          count,
        }),
      );

      entries.sort((a, b) => {
        if (b.order !== a.order) {
          return b.order - a.order;
        }
        return a.property.localeCompare(b.property);
      });

      acc[attribute] = entries;
      return acc;
    },
    {},
  );

  return {
    attributes,
    properties,
  };
};

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

  const selectedTraits = useMemo(() => {
    return Object.entries(activeFilters).flatMap(([trait, values]) =>
      Array.from(values).map((value) => ({ name: trait, value })),
    );
  }, [activeFilters]);

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

  const precomputed = useMemo(
    () => buildPrecomputed(availableFilters),
    [availableFilters],
  );

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

    return tokens.filter((token) => tokenMatchesFilters(token, activeFilters));
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
