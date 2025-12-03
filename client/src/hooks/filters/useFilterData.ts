import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import {
  buildAvailableFilters,
  flattenActiveFilters,
} from "@cartridge/arcade/marketplace";
import { filtersAtom, DEFAULT_STATUS_FILTER } from "@/effect/atoms";
import { metadataAtom, unwrapOr, isLoading as isResultLoading } from "@/effect";
import type {
  ActiveFilters,
  AvailableFilters,
  StatusFilter,
} from "@/types/metadata-filter.types";

const EMPTY_ACTIVE_FILTERS: ActiveFilters = {};

export interface UseFilterDataReturn {
  activeFilters: ActiveFilters;
  statusFilter: StatusFilter;
  availableFilters: AvailableFilters;
  hasActiveFilters: boolean;
  filterCount: number;
  isMetadataLoading: boolean;
}

export function useFilterData(collectionAddress: string): UseFilterDataReturn {
  const collections = useAtomValue(filtersAtom);
  const collectionState = collections[collectionAddress];

  const activeFilters = collectionState?.activeFilters ?? EMPTY_ACTIVE_FILTERS;
  const statusFilter = collectionState?.statusFilter ?? DEFAULT_STATUS_FILTER;

  const selectedTraits = useMemo(
    () => flattenActiveFilters(activeFilters),
    [activeFilters],
  );

  const metadataResult = useAtomValue(
    metadataAtom({
      contractAddress: collectionAddress,
      traits: selectedTraits,
    }),
  );
  const metadata = unwrapOr(metadataResult, []);
  const isMetadataLoading = isResultLoading(metadataResult);

  const availableFilters = useMemo(
    () => buildAvailableFilters(metadata, activeFilters),
    [metadata, activeFilters],
  );

  const hasActiveFilters = useMemo(
    () => Object.keys(activeFilters).length > 0,
    [activeFilters],
  );

  const filterCount = useMemo(() => {
    return Object.values(activeFilters).reduce(
      (count, values) => count + values.size,
      0,
    );
  }, [activeFilters]);

  return {
    activeFilters,
    statusFilter,
    availableFilters,
    hasActiveFilters,
    filterCount,
    isMetadataLoading,
  };
}
