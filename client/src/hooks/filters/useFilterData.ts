import { useMemo, useState, useCallback } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import {
  buildAvailableFilters,
  flattenActiveFilters,
  type TraitNameSummary,
} from "@cartridge/arcade/marketplace";
import {
  collectionFiltersAtom,
  traitNamesAtom,
  metadataAtom,
  expandedTraitsMetadataAtom,
} from "@/effect/atoms";
import { unwrapOr, isLoading as isResultLoading } from "@/effect";
import type {
  ActiveFilters,
  AvailableFilters,
  StatusFilter,
} from "@/types/metadata-filter.types";

const EMPTY_ACTIVE_FILTERS: ActiveFilters = {};

export interface UseFilterDataReturn {
  activeFilters: ActiveFilters;
  statusFilter: StatusFilter;
  ownerFilter: string | undefined;
  traitSummary: TraitNameSummary[];
  availableFilters: AvailableFilters;
  hasActiveFilters: boolean;
  filterCount: number;
  isMetadataLoading: boolean;
  isSummaryLoading: boolean;
  expandedTraits: Set<string>;
  expandTrait: (traitName: string) => void;
  collapseTrait: (traitName: string) => void;
}

export function useFilterData(collectionAddress: string): UseFilterDataReturn {
  const collectionState = useAtomValue(
    collectionFiltersAtom(collectionAddress),
  );

  const activeFilters = collectionState?.activeFilters ?? EMPTY_ACTIVE_FILTERS;
  const statusFilter = collectionState?.statusFilter;
  const ownerFilter = collectionState?.ownerFilter;

  const [expandedTraits, setExpandedTraits] = useState<Set<string>>(new Set());

  const expandTrait = useCallback((traitName: string) => {
    setExpandedTraits((prev) => new Set([...prev, traitName]));
  }, []);

  const collapseTrait = useCallback((traitName: string) => {
    setExpandedTraits((prev) => {
      const next = new Set(prev);
      next.delete(traitName);
      return next;
    });
  }, []);

  const traitNamesResult = useAtomValue(
    traitNamesAtom({
      contractAddress: collectionAddress,
    }),
  );
  const traitSummary = unwrapOr(traitNamesResult, []);
  const isSummaryLoading = isResultLoading(traitNamesResult);

  const selectedTraits = useMemo(
    () => flattenActiveFilters(activeFilters),
    [activeFilters],
  );

  const hasActiveFilters = useMemo(
    () => Object.keys(activeFilters).length > 0,
    [activeFilters],
  );

  const metadataResult = useAtomValue(
    metadataAtom({
      contractAddress: collectionAddress,
      traits: selectedTraits,
    }),
  );
  const activeFilterMetadata = hasActiveFilters
    ? unwrapOr(metadataResult, [])
    : [];
  const isActiveMetadataLoading =
    hasActiveFilters && isResultLoading(metadataResult);

  const expandedTraitNames = useMemo(
    () => Array.from(expandedTraits),
    [expandedTraits],
  );

  const expandedMetadataResult = useAtomValue(
    expandedTraitsMetadataAtom({
      contractAddress: collectionAddress,
      traitNames: expandedTraitNames,
      otherTraitFilters: selectedTraits.length > 0 ? selectedTraits : undefined,
    }),
  );
  const expandedMetadata =
    expandedTraitNames.length > 0 ? unwrapOr(expandedMetadataResult, []) : [];
  const isExpandedMetadataLoading =
    expandedTraitNames.length > 0 && isResultLoading(expandedMetadataResult);

  const combinedMetadata = useMemo(() => {
    const combined = [...activeFilterMetadata, ...expandedMetadata];
    const unique = new Map<string, (typeof combined)[0]>();
    for (const item of combined) {
      const key = `${item.traitName}::${item.traitValue}`;
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    }
    return Array.from(unique.values());
  }, [activeFilterMetadata, expandedMetadata]);

  const isMetadataLoading =
    isActiveMetadataLoading || isExpandedMetadataLoading;

  const availableFilters = useMemo(() => {
    const filters = buildAvailableFilters(combinedMetadata, activeFilters);

    for (const summary of traitSummary) {
      if (!filters[summary.traitName]) {
        filters[summary.traitName] = {};
      }
    }

    return filters;
  }, [combinedMetadata, activeFilters, traitSummary]);

  const filterCount = useMemo(() => {
    return Object.values(activeFilters).reduce(
      (count, values) => count + values.size,
      0,
    );
  }, [activeFilters]);

  return {
    activeFilters,
    statusFilter,
    ownerFilter,
    traitSummary,
    availableFilters,
    hasActiveFilters,
    filterCount,
    isMetadataLoading,
    isSummaryLoading,
    expandedTraits,
    expandTrait,
    collapseTrait,
  };
}
