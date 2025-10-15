import type { Token } from "@dojoengine/torii-wasm/types";
import { addAddressPadding } from "starknet";
import { fetchToriis } from "../modules/torii-fetcher";
import { DEFAULT_PROJECT_ID, parseJsonSafe, resolveProjects } from "./utils";

export interface TraitSelection {
  name: string;
  value: string;
}

export interface TraitMetadataRow {
  traitName: string;
  traitValue: string;
  count: number;
}

export type ActiveFilters = Record<string, Set<string>>;

export type AvailableFilters = Record<string, Record<string, number>>;

export interface PrecomputedFilterProperty {
  property: string;
  order: number;
  count: number;
}

export interface PrecomputedFilterData {
  attributes: string[];
  properties: Record<string, PrecomputedFilterProperty[]>;
}

export interface CollectionTraitMetadataPage {
  projectId: string;
  traits: TraitMetadataRow[];
}

export interface CollectionTraitMetadataError {
  projectId?: string;
  error: Error;
}

export interface FetchCollectionTraitMetadataOptions {
  address: string;
  projects?: string[];
  traits?: TraitSelection[];
  defaultProjectId?: string;
}

export interface FetchCollectionTraitMetadataResult {
  pages: CollectionTraitMetadataPage[];
  errors: CollectionTraitMetadataError[];
}

const escapeSqlValue = (value: string): string => {
  return value.replace(/'/g, "''");
};

const buildTraitWhereClause = (traits: TraitSelection[]): string => {
  if (!traits.length) {
    return "1 = 1";
  }

  return traits
    .map(({ name, value }) => {
      const traitName = escapeSqlValue(name);
      const traitValue = escapeSqlValue(value);
      return `(trait_name LIKE '${traitName}' AND trait_value LIKE '${traitValue}')`;
    })
    .join(" OR ");
};

const buildTraitMetadataQuery = ({
  address,
  traits,
}: {
  address: string;
  traits: TraitSelection[];
}): string => {
  const paddedAddress = addAddressPadding(address);
  const whereClause = buildTraitWhereClause(traits);
  const havingClause = traits.length
    ? `HAVING COUNT(DISTINCT trait_name) = ${traits.length}`
    : "";

  return `SELECT
        trait_name,
        trait_value,
        count
    FROM (
        SELECT
            trait_name,
            trait_value,
            COUNT(*) AS count,
            ROW_NUMBER() OVER (PARTITION BY trait_value ORDER BY COUNT(*) DESC) AS rn
        FROM token_attributes
        WHERE token_id IN (
            SELECT token_id
            FROM token_attributes
            WHERE ${whereClause}
              AND token_id LIKE '${paddedAddress}:%'
            GROUP BY token_id
            ${havingClause}
        )
        GROUP BY trait_name, trait_value
    ) ranked
    WHERE rn = 1
    ORDER BY trait_value, trait_name;`;
};

const normalizeMetadataRow = (row: any): TraitMetadataRow | null => {
  if (!row) return null;

  const traitName =
    typeof row.trait_name === "string"
      ? row.trait_name
      : typeof row.traitName === "string"
        ? row.traitName
        : null;

  const traitValue =
    typeof row.trait_value === "string"
      ? row.trait_value
      : typeof row.traitValue === "string"
        ? row.traitValue
        : null;

  if (!traitName || !traitValue) {
    return null;
  }

  const countRaw =
    typeof row.count === "number"
      ? row.count
      : typeof row.count === "string"
        ? Number.parseInt(row.count, 10)
        : Number(row.count ?? 0);

  const count = Number.isFinite(countRaw) ? Number(countRaw) : 0;

  return { traitName, traitValue, count };
};

const extractRows = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

export function flattenActiveFilters(
  activeFilters: ActiveFilters,
): TraitSelection[] {
  return Object.entries(activeFilters).flatMap(([name, values]) =>
    Array.from(values).map((value) => ({ name, value })),
  );
}

export async function fetchCollectionTraitMetadata(
  options: FetchCollectionTraitMetadataOptions,
): Promise<FetchCollectionTraitMetadataResult> {
  const {
    address,
    projects,
    traits = [],
    defaultProjectId = DEFAULT_PROJECT_ID,
  } = options;

  const projectIds = resolveProjects(projects, defaultProjectId);
  if (projectIds.length === 0) {
    return { pages: [], errors: [] };
  }

  const query = buildTraitMetadataQuery({ address, traits });

  const response = await fetchToriis(projectIds, {
    sql: query,
  });

  const pages: CollectionTraitMetadataPage[] = [];
  const unmatchedProjects = new Set(projectIds);

  for (const entry of response.data ?? []) {
    if (!entry) continue;
    const projectId =
      typeof entry.endpoint === "string"
        ? entry.endpoint
        : projectIds.length === 1
          ? projectIds[0]
          : undefined;

    if (!projectId) continue;

    unmatchedProjects.delete(projectId);

    const rows = extractRows(entry.data);
    const traitsForProject: TraitMetadataRow[] = [];

    for (const row of rows) {
      const normalized = normalizeMetadataRow(row);
      if (!normalized) continue;
      traitsForProject.push(normalized);
    }

    pages.push({
      projectId,
      traits: traitsForProject,
    });
  }

  const errors: CollectionTraitMetadataError[] = [];
  const rawErrors = response.errors ?? [];
  const remainingProjects = Array.from(unmatchedProjects);

  rawErrors.forEach((error, index) => {
    const projectId = remainingProjects[index];
    errors.push({
      projectId,
      error: error instanceof Error ? error : new Error(String(error)),
    });
  });

  return { pages, errors };
}

export function aggregateTraitMetadata(
  pages: CollectionTraitMetadataPage[],
): TraitMetadataRow[] {
  const aggregate = new Map<string, TraitMetadataRow>();

  for (const page of pages) {
    for (const trait of page.traits) {
      const key = `${trait.traitName}::${trait.traitValue}`;
      const existing = aggregate.get(key);

      if (existing) {
        existing.count += trait.count;
      } else {
        aggregate.set(key, { ...trait });
      }
    }
  }

  return Array.from(aggregate.values());
}

export function buildAvailableFilters(
  metadata: TraitMetadataRow[],
  activeFilters: ActiveFilters,
): AvailableFilters {
  const result: AvailableFilters = {};

  for (const entry of metadata) {
    if (!entry.traitName || entry.traitValue == null) continue;
    if (!result[entry.traitName]) {
      result[entry.traitName] = {};
    }
    result[entry.traitName][entry.traitValue] =
      (result[entry.traitName][entry.traitValue] ?? 0) + entry.count;
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
}

export function buildPrecomputedFilters(
  availableFilters: AvailableFilters,
): PrecomputedFilterData {
  const attributes = Object.keys(availableFilters).sort((a, b) =>
    a.localeCompare(b),
  );

  const properties = attributes.reduce<PrecomputedFilterData["properties"]>(
    (acc, attribute) => {
      const entries = Object.entries(availableFilters[attribute] ?? {}).map(
        ([property, count]) => ({
          property,
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
}

export function tokenMatchesFilters(
  token: Pick<Token, "metadata"> | { metadata?: any },
  activeFilters: ActiveFilters,
): boolean {
  const entries = Object.entries(activeFilters);
  if (entries.length === 0) {
    return true;
  }

  const metadata = parseJsonSafe(token.metadata, token.metadata);

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

    const trait = String(attribute.trait_type);
    const value = String(attribute.value);

    if (!traitMap.has(trait)) {
      traitMap.set(trait, new Set());
    }

    traitMap.get(trait)?.add(value);
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
}

export function filterTokensByMetadata<T extends { metadata?: any }>(
  tokens: T[],
  activeFilters: ActiveFilters,
): T[] {
  if (!tokens || tokens.length === 0) {
    return tokens;
  }

  if (Object.keys(activeFilters).length === 0) {
    return tokens;
  }

  return tokens.filter((token) => tokenMatchesFilters(token, activeFilters));
}
