import type { ActiveFilters } from "@/types/metadata-filter.types";

export const serializeFiltersToURL = (filters: ActiveFilters): string => {
  const filterEntries = Object.entries(filters);

  if (filterEntries.length === 0) {
    return "";
  }

  const parts: string[] = [];

  for (const [trait, values] of filterEntries) {
    if (values.size === 0) continue;

    const traitKey = trait.toLowerCase().replace(/\s+/g, "_");
    const valueList = Array.from(values)
      .map((v) => v.toString().toLowerCase().replace(/\s+/g, "_"))
      .sort()
      .join(",");

    parts.push(`${traitKey}:${valueList}`);
  }

  return parts.join("|");
};

export const parseFiltersFromURL = (urlParams: string): ActiveFilters => {
  const filters: ActiveFilters = {};

  if (!urlParams || urlParams.trim() === "") {
    return filters;
  }

  try {
    const traitPairs = urlParams.split("|");

    for (const pair of traitPairs) {
      if (!pair.includes(":")) continue;

      const [traitKey, valueString] = pair.split(":");
      if (!traitKey || !valueString) continue;

      const trait = traitKey
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const values = valueString.split(",").map((v) => {
        const trimmed = v.trim();
        return trimmed
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      });

      if (values.length > 0) {
        filters[trait] = new Set(values);
      }
    }
  } catch (error) {
    console.error("Error parsing filter URL params:", error);
    return {};
  }

  return filters;
};
