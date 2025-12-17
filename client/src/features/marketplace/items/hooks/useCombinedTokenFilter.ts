import { useMemo } from "react";
import { useAtomValue } from "@effect-atom/atom-react";
import {
  collectionFiltersAtom,
  DEFAULT_STATUS_FILTER,
  ownerTokenIdsAtom,
  unwrapOr,
} from "@/effect";
import type { ActiveFilters } from "@/types/metadata-filter.types";

export function useCombinedTokenFilter(
  collectionAddress: string,
  listedTokenIds: string[],
) {
  const collectionState = useAtomValue(
    collectionFiltersAtom(collectionAddress),
  );
  const activeFilters: ActiveFilters = collectionState?.activeFilters ?? {};
  const statusFilter = collectionState?.statusFilter ?? DEFAULT_STATUS_FILTER;
  const ownerFilter = collectionState?.ownerFilter;

  const ownerTokenIdsResult = useAtomValue(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ownerTokenIdsAtom(collectionAddress, ownerFilter) as any,
  ) as { _tag: string; value?: Set<string> };

  const ownerTokenIds = ownerFilter
    ? unwrapOr(
        ownerTokenIdsResult as
          | { _tag: "Success"; value: Set<string> }
          | { _tag: "Initial" }
          | { _tag: "Failure" },
        new Set<string>(),
      )
    : null;

  const isOwnerFilterLoading =
    ownerFilter && ownerTokenIdsResult._tag === "Initial";

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const { combinedTokenIds, shouldShowEmpty } = useMemo(() => {
    if (ownerFilter && ownerTokenIds) {
      if (ownerTokenIds.size === 0) {
        return { combinedTokenIds: undefined, shouldShowEmpty: true };
      }
      if (statusFilter === "listed" && listedTokenIds.length > 0) {
        const listedSet = new Set(listedTokenIds);
        const intersection = [...ownerTokenIds].filter((id) =>
          listedSet.has(id),
        );
        return {
          combinedTokenIds: intersection.length > 0 ? intersection : undefined,
          shouldShowEmpty: intersection.length === 0,
        };
      }
      return { combinedTokenIds: [...ownerTokenIds], shouldShowEmpty: false };
    }

    if (statusFilter === "listed" && listedTokenIds.length > 0) {
      return { combinedTokenIds: listedTokenIds, shouldShowEmpty: false };
    }

    return { combinedTokenIds: undefined, shouldShowEmpty: false };
  }, [ownerFilter, ownerTokenIds, statusFilter, listedTokenIds]);

  return {
    combinedTokenIds,
    shouldShowEmpty,
    isOwnerFilterLoading,
    statusFilter,
    ownerFilter,
    activeFilters,
    hasActiveFilters,
  };
}
