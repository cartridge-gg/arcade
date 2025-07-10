import { useContext } from "react";
import { MarketFiltersContext } from "@/context/market-filters";

/**
 * Custom hook to access the MarketFilters context and account information.
 * Must be used within a MarketFiltersProvider component.
 *
 * @returns An object containing:
 * - active: The active filter
 * - metadata: The metadata
 * - filteredMetadata: The filtered metadata
 * - setActive: The function to set the active filter
 * - setMetadata: The function to set the metadata
 * - setFilteredMetadata: The function to set the filtered metadata
 * - setActive: The function to set the active filter
 * @throws {Error} If used outside of a MarketFiltersProvider context
 */
export const useMarketFilters = () => {
  const context = useContext(MarketFiltersContext);

  if (!context) {
    throw new Error(
      "The `useFilters` hook must be used within a `MarketFiltersProvider`",
    );
  }

  const {
    active,
    isActive,
    setActive,
    allMetadata,
    setAllMetadata,
    filteredMetadata,
    setFilteredMetadata,
    addSelected,
    isSelected,
    resetSelected,
    clearable,
    empty,
  } = context;

  return {
    active,
    isActive,
    setActive,
    allMetadata,
    setAllMetadata,
    filteredMetadata,
    setFilteredMetadata,
    addSelected,
    isSelected,
    resetSelected,
    clearable,
    empty,
  };
};
