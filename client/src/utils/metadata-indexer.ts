import {
  MetadataIndex,
  ActiveFilters,
  AvailableFilters,
  PrecomputedFilterData,
  PrecomputedProperty,
  BuildMetadataIndex,
  UpdateMetadataIndex,
  ExtractTokenAttributes,
  CalculateFilterCounts,
  ApplyFilters,
  SerializeFiltersToURL,
  ParseFiltersFromURL,
} from "@/types/metadata-filter.types";

/**
 * Build metadata index from a collection of tokens
 */
export const buildMetadataIndex: BuildMetadataIndex = (tokens) => {
  const index: MetadataIndex = {};

  for (const token of tokens) {
    const attributes = extractTokenAttributes(token);

    if (attributes.length === 0) {
      // Handle tokens without attributes
      if (!index["No Traits"]) {
        index["No Traits"] = {};
      }
      if (!index["No Traits"]["true"]) {
        index["No Traits"]["true"] = [];
      }
      index["No Traits"]["true"].push(token.token_id || "");
      continue;
    }

    for (const attr of attributes) {
      if (!attr.trait_type || attr.value === undefined || attr.value === null) {
        continue;
      }

      const trait = attr.trait_type;
      const value = String(attr.value);

      if (!index[trait]) {
        index[trait] = {};
      }
      if (!index[trait][value]) {
        index[trait][value] = [];
      }

      const tokenId = token.token_id || "";
      if (!index[trait][value].includes(tokenId)) {
        index[trait][value].push(tokenId);
      }
    }
  }

  return index;
};

/**
 * Update existing metadata index with new tokens
 */
export const updateMetadataIndex: UpdateMetadataIndex = (
  existingIndex,
  newTokens,
) => {
  // Create a deep copy of the existing index
  const updatedIndex: MetadataIndex = JSON.parse(JSON.stringify(existingIndex));

  for (const token of newTokens) {
    const attributes = extractTokenAttributes(token);

    if (attributes.length === 0) {
      if (!updatedIndex["No Traits"]) {
        updatedIndex["No Traits"] = {};
      }
      if (!updatedIndex["No Traits"]["true"]) {
        updatedIndex["No Traits"]["true"] = [];
      }
      const tokenId = token.token_id || "";
      if (!updatedIndex["No Traits"]["true"].includes(tokenId)) {
        updatedIndex["No Traits"]["true"].push(tokenId);
      }
      continue;
    }

    for (const attr of attributes) {
      if (!attr.trait_type || attr.value === undefined || attr.value === null) {
        continue;
      }

      const trait = attr.trait_type;
      const value = String(attr.value);

      if (!updatedIndex[trait]) {
        updatedIndex[trait] = {};
      }
      if (!updatedIndex[trait][value]) {
        updatedIndex[trait][value] = [];
      }

      const tokenId = token.token_id || "";
      if (!updatedIndex[trait][value].includes(tokenId)) {
        updatedIndex[trait][value].push(tokenId);
      }
    }
  }

  return updatedIndex;
};

/**
 * Extract attributes from token metadata
 */
export const extractTokenAttributes: ExtractTokenAttributes = (token) => {
  if (!token.metadata) {
    return [];
  }

  const metadata = token.metadata as any;

  if (!metadata.attributes || !Array.isArray(metadata.attributes)) {
    return [];
  }

  return metadata.attributes.filter(
    (attr: any) => attr && attr.trait_type && attr.value !== undefined,
  );
};

/**
 * Calculate filter counts for available options
 */
export const calculateFilterCounts: CalculateFilterCounts = (
  metadataIndex,
  tokenIds,
) => {
  const counts: AvailableFilters = {};
  const validTokenIds = tokenIds ? new Set(tokenIds) : null;

  for (const [trait, values] of Object.entries(metadataIndex)) {
    counts[trait] = {};

    for (const [value, ids] of Object.entries(values)) {
      if (validTokenIds) {
        // Count only tokens in the provided subset
        const matchingIds = ids.filter((id) => validTokenIds.has(id));
        counts[trait][value] = matchingIds.length;
      } else {
        // Count all tokens
        counts[trait][value] = ids.length;
      }
    }
  }

  return counts;
};

/**
 * Apply filters to metadata index and return matching token IDs
 */
export const applyFilters: ApplyFilters = (metadataIndex, activeFilters) => {
  const filterEntries = Object.entries(activeFilters);

  // If no filters, return all token IDs
  if (filterEntries.length === 0) {
    const allTokenIds = new Set<string>();
    for (const values of Object.values(metadataIndex)) {
      for (const ids of Object.values(values)) {
        ids.forEach((id) => allTokenIds.add(id));
      }
    }
    return Array.from(allTokenIds);
  }

  // Start with null to distinguish first iteration
  let resultSet: Set<string> | null = null;

  for (const [trait, selectedValues] of filterEntries) {
    if (!metadataIndex[trait]) {
      // Trait doesn't exist, no matches possible
      return [];
    }

    // Get all token IDs that match any of the selected values for this trait (OR within trait)
    const traitMatches = new Set<string>();
    for (const value of selectedValues) {
      const tokenIds = metadataIndex[trait][value] || [];
      tokenIds.forEach((id) => traitMatches.add(id));
    }

    if (resultSet === null) {
      // First trait, initialize result set
      resultSet = traitMatches;
    } else {
      // Subsequent traits, apply AND logic (intersection)
      const intersection = new Set<string>();
      for (const id of resultSet) {
        if (traitMatches.has(id)) {
          intersection.add(id);
        }
      }
      resultSet = intersection;
    }

    // Early exit if no matches
    if (resultSet.size === 0) {
      return [];
    }
  }

  return Array.from(resultSet || []);
};

/**
 * Serialize active filters to URL parameter string
 */
export const serializeFiltersToURL: SerializeFiltersToURL = (filters) => {
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

/**
 * Parse filters from URL parameter string
 */
export const parseFiltersFromURL: ParseFiltersFromURL = (urlParams) => {
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

      // Convert back from URL format to display format
      const trait = traitKey
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const values = valueString.split(",").map((v) => v.trim());

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

/**
 * Pre-compute filter data for performance optimization
 * This runs once during index building to avoid repeated calculations in UI
 */
export const precomputeFilterData = (
  metadataIndex: MetadataIndex,
): PrecomputedFilterData => {
  // Extract and sort unique attributes
  const attributes = Object.keys(metadataIndex).sort();

  // Pre-compute properties with counts for each trait
  const properties: { [trait: string]: PrecomputedProperty[] } = {};

  for (const trait of attributes) {
    const traitValues = metadataIndex[trait];
    const props: PrecomputedProperty[] = [];

    for (const [value, tokenIds] of Object.entries(traitValues)) {
      props.push({
        property: value,
        order: tokenIds.length,
      });
    }

    // Sort properties by count (descending) then alphabetically
    props.sort((a, b) => {
      if (b.order !== a.order) {
        return b.order - a.order;
      }
      return a.property.localeCompare(b.property);
    });

    properties[trait] = props;
  }

  // Pre-compute the allMetadata format used by the UI
  const allMetadata: Array<{
    trait_type: string;
    value: string;
    tokens: Array<{ token_id: string }>;
  }> = [];

  for (const [trait, values] of Object.entries(metadataIndex)) {
    for (const [value, tokenIds] of Object.entries(values)) {
      allMetadata.push({
        trait_type: trait,
        value: value,
        tokens: tokenIds.map((id) => ({ token_id: id })),
      });
    }
  }

  return {
    attributes,
    properties,
    allMetadata,
  };
};
