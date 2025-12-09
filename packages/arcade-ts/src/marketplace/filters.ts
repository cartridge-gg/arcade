import type { Token } from "@dojoengine/torii-wasm/types";
import { addAddressPadding } from "starknet";
import { fetchToriis } from "../modules/torii-fetcher";
import { DEFAULT_PROJECT_ID, parseJsonSafe, resolveProjects } from "./utils";
import type { ToriiGrpcClient } from "@dojoengine/grpc";

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

export interface TraitNameSummary {
  traitName: string;
  valueCount: number;
}

export interface TraitNameSummaryPage {
  projectId: string;
  traits: TraitNameSummary[];
}

export interface FetchTraitNamesSummaryOptions {
  address: string;
  projects?: string[];
  defaultProjectId?: string;
}

export interface FetchTraitNamesSummaryResult {
  pages: TraitNameSummaryPage[];
  errors: CollectionTraitMetadataError[];
}

export interface TraitValueRow {
  traitValue: string;
  count: number;
}

export interface TraitValuePage {
  projectId: string;
  values: TraitValueRow[];
}

export interface FetchTraitValuesOptions {
  address: string;
  traitName: string;
  otherTraitFilters?: TraitSelection[];
  projects?: string[];
  defaultProjectId?: string;
}

export interface FetchTraitValuesResult {
  pages: TraitValuePage[];
  errors: CollectionTraitMetadataError[];
}

export interface FetchExpandedTraitsMetadataOptions {
  address: string;
  traitNames: string[];
  otherTraitFilters?: TraitSelection[];
  projects?: string[];
  defaultProjectId?: string;
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

const buildTraitNamesSummaryQuery = (address: string): string => {
  const paddedAddress = addAddressPadding(address);
  return `SELECT 
				trait_name,
				COUNT(DISTINCT trait_value) as value_count,
				SUM(cnt) as total_count
			FROM (
				SELECT trait_name, trait_value, COUNT(*) as cnt
				FROM token_attributes
				WHERE token_id IN (
					SELECT token_id
					FROM token_attributes
					WHERE token_id LIKE '${paddedAddress}:%'
					GROUP BY token_id
				)
				GROUP BY trait_name, trait_value
			)
			GROUP BY trait_name
			ORDER BY trait_name;`;
};

const buildTraitValuesQuery = ({
  address,
  traitName,
  otherTraitFilters = [],
}: {
  address: string;
  traitName: string;
  otherTraitFilters?: TraitSelection[];
}): string => {
  const paddedAddress = addAddressPadding(address);
  const escapedTraitName = escapeSqlValue(traitName);

  if (otherTraitFilters.length === 0) {
    return `SELECT trait_value, COUNT(*) as count
FROM token_attributes
WHERE token_id LIKE '${paddedAddress}:%'
  AND trait_name = '${escapedTraitName}'
GROUP BY trait_value
ORDER BY count DESC`;
  }

  const whereClause = buildTraitWhereClause(otherTraitFilters);
  return `SELECT trait_value, COUNT(*) as count
FROM token_attributes
WHERE trait_name = '${escapedTraitName}'
  AND token_id IN (
    SELECT token_id
    FROM token_attributes
    WHERE ${whereClause}
      AND token_id LIKE '${paddedAddress}:%'
    GROUP BY token_id
    HAVING COUNT(DISTINCT trait_name) = ${otherTraitFilters.length}
  )
GROUP BY trait_value
ORDER BY count DESC`;
};

const buildExpandedTraitsMetadataQuery = ({
  address,
  traitNames,
  otherTraitFilters = [],
}: {
  address: string;
  traitNames: string[];
  otherTraitFilters?: TraitSelection[];
}): string => {
  const paddedAddress = addAddressPadding(address);

  if (traitNames.length === 0) {
    return "SELECT trait_name, trait_value, 0 as count WHERE 1 = 0";
  }

  const traitNamesCondition = traitNames
    .map((name) => `'${escapeSqlValue(name)}'`)
    .join(", ");

  if (otherTraitFilters.length === 0) {
    return `SELECT trait_name, trait_value, COUNT(*) as count
FROM token_attributes
WHERE token_id LIKE '${paddedAddress}:%'
  AND trait_name IN (${traitNamesCondition})
GROUP BY trait_name, trait_value
ORDER BY trait_name, count DESC`;
  }

  const whereClause = buildTraitWhereClause(otherTraitFilters);
  return `SELECT trait_name, trait_value, COUNT(*) as count
FROM token_attributes
WHERE trait_name IN (${traitNamesCondition})
  AND token_id IN (
    SELECT token_id
    FROM token_attributes
    WHERE ${whereClause}
      AND token_id LIKE '${paddedAddress}:%'
    GROUP BY token_id
    HAVING COUNT(DISTINCT trait_name) = ${otherTraitFilters.length}
  )
GROUP BY trait_name, trait_value
ORDER BY trait_name, count DESC`;
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

  return `SELECT trait_name, trait_value, COUNT(*) AS count
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
ORDER BY trait_name, count DESC`;
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
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.result)) return data.result;
  return [];
};

const normalizeTraitNameSummary = (row: any): TraitNameSummary | null => {
  if (!row) return null;

  const traitName =
    typeof row.trait_name === "string"
      ? row.trait_name
      : typeof row.traitName === "string"
        ? row.traitName
        : null;

  if (!traitName) return null;

  const valueCountRaw =
    typeof row.value_count === "number"
      ? row.value_count
      : typeof row.valueCount === "number"
        ? row.valueCount
        : typeof row.value_count === "bigint"
          ? Number(row.value_count)
          : typeof row.valueCount === "bigint"
            ? Number(row.valueCount)
            : typeof row.value_count === "string"
              ? Number.parseInt(row.value_count, 10)
              : typeof row.valueCount === "string"
                ? Number.parseInt(row.valueCount, 10)
                : 0;

  const valueCount = Number.isFinite(valueCountRaw) ? valueCountRaw : 0;

  return { traitName, valueCount };
};

const normalizeTraitValueRow = (row: any): TraitValueRow | null => {
  if (!row) return null;

  const traitValue =
    typeof row.trait_value === "string"
      ? row.trait_value
      : typeof row.traitValue === "string"
        ? row.traitValue
        : null;

  if (!traitValue) return null;

  const countRaw =
    typeof row.count === "number"
      ? row.count
      : typeof row.count === "bigint"
        ? Number(row.count)
        : typeof row.count === "string"
          ? Number.parseInt(row.count, 10)
          : 0;

  const count = Number.isFinite(countRaw) ? countRaw : 0;

  return { traitValue, count };
};

export async function fetchTraitNamesSummary(
  options: FetchTraitNamesSummaryOptions,
): Promise<FetchTraitNamesSummaryResult> {
  const { address, projects, defaultProjectId = DEFAULT_PROJECT_ID } = options;

  const projectIds = resolveProjects(projects, defaultProjectId);
  if (projectIds.length === 0) {
    return { pages: [], errors: [] };
  }

  const query = buildTraitNamesSummaryQuery(address);

  const response = await fetchToriis(projectIds, {
    client: async ({ client }) => {
      return await (client as ToriiGrpcClient).executeSql(query);
    },
    native: true,
  });

  const pages: TraitNameSummaryPage[] = [];
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

    const rows = extractRows(entry);
    const traits: TraitNameSummary[] = [];

    for (const row of rows) {
      const normalized = normalizeTraitNameSummary(row);
      if (normalized) traits.push(normalized);
    }

    pages.push({ projectId, traits });
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

export function aggregateTraitNamesSummary(
  pages: TraitNameSummaryPage[],
): TraitNameSummary[] {
  const aggregate = new Map<string, TraitNameSummary>();

  for (const page of pages) {
    for (const trait of page.traits) {
      const existing = aggregate.get(trait.traitName);
      if (existing) {
        existing.valueCount = Math.max(existing.valueCount, trait.valueCount);
      } else {
        aggregate.set(trait.traitName, { ...trait });
      }
    }
  }

  return Array.from(aggregate.values()).sort((a, b) =>
    a.traitName.localeCompare(b.traitName),
  );
}

export async function fetchTraitValues(
  options: FetchTraitValuesOptions,
): Promise<FetchTraitValuesResult> {
  const {
    address,
    traitName,
    otherTraitFilters = [],
    projects,
    defaultProjectId = DEFAULT_PROJECT_ID,
  } = options;

  const projectIds = resolveProjects(projects, defaultProjectId);
  if (projectIds.length === 0) {
    return { pages: [], errors: [] };
  }

  const query = buildTraitValuesQuery({
    address,
    traitName,
    otherTraitFilters,
  });

  const response = await fetchToriis(projectIds, {
    client: async ({ client }) => {
      return await (client as ToriiGrpcClient).executeSql(query);
    },
    native: true,
  });

  const pages: TraitValuePage[] = [];
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

    const rows = extractRows(entry);
    const values: TraitValueRow[] = [];

    for (const row of rows) {
      const normalized = normalizeTraitValueRow(row);
      if (normalized) values.push(normalized);
    }

    pages.push({ projectId, values });
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

export function aggregateTraitValues(pages: TraitValuePage[]): TraitValueRow[] {
  const aggregate = new Map<string, TraitValueRow>();

  for (const page of pages) {
    for (const value of page.values) {
      const existing = aggregate.get(value.traitValue);
      if (existing) {
        existing.count += value.count;
      } else {
        aggregate.set(value.traitValue, { ...value });
      }
    }
  }

  return Array.from(aggregate.values()).sort((a, b) => b.count - a.count);
}

export async function fetchExpandedTraitsMetadata(
  options: FetchExpandedTraitsMetadataOptions,
): Promise<FetchCollectionTraitMetadataResult> {
  const {
    address,
    traitNames,
    otherTraitFilters,
    projects,
    defaultProjectId = DEFAULT_PROJECT_ID,
  } = options;

  if (traitNames.length === 0) {
    return { pages: [], errors: [] };
  }

  const projectIds = resolveProjects(projects, defaultProjectId);
  if (projectIds.length === 0) {
    return { pages: [], errors: [] };
  }

  const query = buildExpandedTraitsMetadataQuery({
    address,
    traitNames,
    otherTraitFilters,
  });

  const response = await fetchToriis(projectIds, {
    client: async ({ client }) => {
      return await (client as ToriiGrpcClient).executeSql(query);
    },
    native: true,
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

    const rows = extractRows(entry);
    const traitsForProject: TraitMetadataRow[] = [];

    for (const row of rows) {
      const normalized = normalizeMetadataRow(row);
      if (normalized) traitsForProject.push(normalized);
    }

    pages.push({ projectId, traits: traitsForProject });
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
    client: async ({ client }) => {
      return await (client as ToriiGrpcClient).executeSql(query);
    },
    native: true,
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

    const rows = extractRows(entry);
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
