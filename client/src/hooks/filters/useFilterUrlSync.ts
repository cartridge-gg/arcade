import { useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAtomValue } from "@effect-atom/atom-react";
import { collectionFiltersAtom } from "@/effect/atoms";
import {
  parseFiltersFromURL,
  serializeFiltersToURL,
} from "@/utils/marketplace-filters";
import type { UseFilterActionsReturn } from "./useFilterActions";

const URL_SYNC_DEBOUNCE_MS = 250;

interface UseFilterUrlSyncOptions {
  collectionAddress: string;
  enabled?: boolean;
  replaceFilters: UseFilterActionsReturn["replaceFilters"];
  setOwnerFilter: UseFilterActionsReturn["setOwnerFilter"];
}

export function useFilterUrlSync({
  collectionAddress,
  enabled = true,
  replaceFilters,
  setOwnerFilter,
}: UseFilterUrlSyncOptions): void {
  const navigate = useNavigate();
  const { location } = useRouterState();

  const collectionState = useAtomValue(
    collectionFiltersAtom(collectionAddress),
  );
  const activeFilters = collectionState?.activeFilters ?? {};
  const ownerFilter = collectionState?.ownerFilter;
  const isPlayerAddress = collectionState?.isPlayerAddress ?? false;

  const hasSyncedFromURL = useRef(false);
  const prevSerializedFilters = useRef<string | null>(null);
  const prevOwnerFilter = useRef<string | null>(null);
  const isUpdatingFromURL = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (hasSyncedFromURL.current) return;

    const searchParams = new URLSearchParams(location.searchStr ?? "");
    const filterParam = searchParams.get("filters");
    const ownerParam = searchParams.get("owner");

    isUpdatingFromURL.current = true;

    if (filterParam) {
      const parsedFilters = parseFiltersFromURL(filterParam);
      replaceFilters(parsedFilters);
      prevSerializedFilters.current = filterParam;
    } else if (!collectionState) {
      replaceFilters({});
      prevSerializedFilters.current = "";
    }

    if (ownerParam) {
      setOwnerFilter(ownerParam);
      prevOwnerFilter.current = ownerParam;
    }

    hasSyncedFromURL.current = true;
    isUpdatingFromURL.current = false;
  }, [
    collectionAddress,
    collectionState,
    enabled,
    location.searchStr,
    replaceFilters,
    setOwnerFilter,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (!hasSyncedFromURL.current) return;
    if (isUpdatingFromURL.current) return;

    const serialized = serializeFiltersToURL(activeFilters);
    const filtersChanged = prevSerializedFilters.current !== serialized;
    const ownerChanged = prevOwnerFilter.current !== (ownerFilter ?? null);

    if (!filtersChanged && !ownerChanged) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      prevSerializedFilters.current = serialized;
      prevOwnerFilter.current = ownerFilter ?? null;

      const nextParams = new URLSearchParams(location.searchStr ?? "");

      if (serialized) {
        nextParams.set("filters", serialized);
      } else {
        nextParams.delete("filters");
      }

      if (ownerFilter && !isPlayerAddress) {
        nextParams.set("owner", ownerFilter);
      } else {
        nextParams.delete("owner");
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
    }, URL_SYNC_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    activeFilters,
    ownerFilter,
    isPlayerAddress,
    enabled,
    navigate,
    location.pathname,
    location.searchStr,
  ]);
}
