import { useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAtomValue } from "@effect-atom/atom-react";
import { filtersAtom } from "@/effect/atoms";
import {
  parseFiltersFromURL,
  serializeFiltersToURL,
} from "@/utils/marketplace-filters";
import type { UseFilterActionsReturn } from "./useFilterActions";

interface UseFilterUrlSyncOptions {
  collectionAddress: string;
  enabled?: boolean;
  replaceFilters: UseFilterActionsReturn["replaceFilters"];
}

export function useFilterUrlSync({
  collectionAddress,
  enabled = true,
  replaceFilters,
}: UseFilterUrlSyncOptions): void {
  const navigate = useNavigate();
  const { location } = useRouterState();

  const collections = useAtomValue(filtersAtom);
  const collectionState = collections[collectionAddress];
  const activeFilters = collectionState?.activeFilters ?? {};

  const hasSyncedFromURL = useRef(false);
  const prevSerializedFilters = useRef<string | null>(null);
  const isUpdatingFromURL = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    if (hasSyncedFromURL.current) return;

    const searchParams = new URLSearchParams(location.searchStr ?? "");
    const filterParam = searchParams.get("filters");

    isUpdatingFromURL.current = true;

    if (filterParam) {
      const parsedFilters = parseFiltersFromURL(filterParam);
      replaceFilters(parsedFilters);
      prevSerializedFilters.current = filterParam;
    } else if (!collectionState) {
      replaceFilters({});
      prevSerializedFilters.current = "";
    }

    hasSyncedFromURL.current = true;
    isUpdatingFromURL.current = false;
  }, [
    collectionAddress,
    collectionState,
    enabled,
    location.searchStr,
    replaceFilters,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (!hasSyncedFromURL.current) return;
    if (isUpdatingFromURL.current) return;

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
}
