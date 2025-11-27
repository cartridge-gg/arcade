import { useMemo } from "react";
import type { Token } from "@dojoengine/torii-wasm";
import {
  buildPrecomputedFilters,
  filterTokensByMetadata,
} from "@cartridge/arcade/marketplace";
import type {
  ActiveFilters,
  AvailableFilters,
  PrecomputedFilterData,
} from "@/types/metadata-filter.types";

export interface UseFilteredTokensReturn {
  filteredTokens: Token[];
  precomputed: PrecomputedFilterData;
  isEmpty: boolean;
}

interface UseFilteredTokensOptions {
  tokens: Token[];
  activeFilters: ActiveFilters;
  availableFilters: AvailableFilters;
  enabled?: boolean;
}

export function useFilteredTokens({
  tokens,
  activeFilters,
  availableFilters,
  enabled = true,
}: UseFilteredTokensOptions): UseFilteredTokensReturn {
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

  const isEmpty =
    filteredTokens.length === 0 && Object.keys(activeFilters).length > 0;

  return {
    filteredTokens,
    precomputed,
    isEmpty,
  };
}
