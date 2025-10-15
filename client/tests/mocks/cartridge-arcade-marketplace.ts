type TraitSelection = {
  name: string;
  value: string;
};

type TraitMetadataRow = {
  traitName: string;
  traitValue: string;
  count: number;
};

type ActiveFilters = Record<string, Set<string>>;
type AvailableFilters = Record<string, Record<string, number>>;

type PrecomputedFilterProperty = {
  property: string;
  order: number;
  count: number;
};

type PrecomputedFilterData = {
  attributes: string[];
  properties: Record<string, PrecomputedFilterProperty[]>;
};

type CollectionTraitMetadataPage = {
  projectId: string;
  traits: TraitMetadataRow[];
};

type CollectionTraitMetadataError = {
  projectId?: string;
  error: Error;
};

type FetchCollectionTraitMetadataOptions = {
  address: string;
  projects?: string[];
  traits?: TraitSelection[];
  defaultProjectId?: string;
};

type FetchCollectionTraitMetadataResult = {
  pages: CollectionTraitMetadataPage[];
  errors: CollectionTraitMetadataError[];
};

type FetchCollectionTokensResult = {
  page?: {
    nextCursor: string | null;
    tokens: Array<{ metadata?: unknown }>;
  };
  error?: { message: string };
};

const flattenActiveFilters = (activeFilters: ActiveFilters): TraitSelection[] => {
  return Object.entries(activeFilters).flatMap(([name, values]) =>
    Array.from(values).map((value) => ({ name, value })),
  );
};

const fetchCollectionTraitMetadata = async (
  _options: FetchCollectionTraitMetadataOptions,
): Promise<FetchCollectionTraitMetadataResult> => {
  return { pages: [], errors: [] };
};

const aggregateTraitMetadata = (
  pages: CollectionTraitMetadataPage[],
): TraitMetadataRow[] => {
  const aggregate = new Map<string, TraitMetadataRow>();

  for (const page of pages ?? []) {
    for (const trait of page.traits ?? []) {
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
};

const buildAvailableFilters = (
  metadata: TraitMetadataRow[],
  activeFilters: ActiveFilters,
): AvailableFilters => {
  const available: AvailableFilters = {};

  for (const entry of metadata ?? []) {
    if (!entry?.traitName || entry.traitValue === undefined) continue;
    const traitValues = (available[entry.traitName] ??= {});
    const key = String(entry.traitValue);
    traitValues[key] = (traitValues[key] ?? 0) + entry.count;
  }

  for (const [trait, values] of Object.entries(activeFilters)) {
    const traitValues = (available[trait] ??= {});
    for (const value of values) {
      const key = String(value);
      if (traitValues[key] === undefined) {
        traitValues[key] = 0;
      }
    }
  }

  return available;
};

const buildPrecomputedFilters = (
  availableFilters: AvailableFilters,
): PrecomputedFilterData => {
  const attributes = Object.keys(availableFilters).sort((a, b) =>
    a.localeCompare(b),
  );

  const properties = attributes.reduce<
    Record<string, PrecomputedFilterProperty[]>
  >((acc, attribute) => {
    const entries = Object.entries(availableFilters[attribute] ?? {}).map(
      ([property, count]) => ({
        property,
        count,
        order: count,
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
  }, {});

  return { attributes, properties };
};

const tokenMatchesFilters = (
  token: { metadata?: unknown },
  activeFilters: ActiveFilters,
): boolean => {
  const entries = Object.entries(activeFilters);
  if (entries.length === 0) {
    return true;
  }

  const rawMetadata =
    typeof token === "object" && token !== null ? token.metadata : undefined;
  const attributes = Array.isArray(
    (rawMetadata as { attributes?: unknown })?.attributes,
  )
    ? ((rawMetadata as { attributes: unknown[] }).attributes ?? [])
    : [];

  if (attributes.length === 0) {
    return false;
  }

  const traitMap = new Map<string, Set<string>>();

  for (const attribute of attributes) {
    if (!attribute || typeof attribute !== "object") continue;
    const record = attribute as Record<string, unknown>;
    const trait =
      typeof record.trait_type === "string"
        ? record.trait_type
        : typeof record.traitName === "string"
          ? record.traitName
          : typeof record.name === "string"
            ? record.name
            : null;
    if (!trait) continue;
    const valueRaw =
      record.value ?? record.traitValue ?? record.value ?? record.property;
    if (valueRaw === undefined || valueRaw === null) continue;
    const value = String(valueRaw);
    const values = traitMap.get(trait) ?? new Set<string>();
    values.add(value);
    traitMap.set(trait, values);
  }

  if (traitMap.size === 0) {
    return false;
  }

  return entries.every(([trait, values]) => {
    const available = traitMap.get(trait);
    if (!available) {
      return false;
    }

    for (const value of values) {
      if (!available.has(String(value))) {
        return false;
      }
    }

    return true;
  });
};

const filterTokensByMetadata = <T extends { metadata?: unknown }>(
  tokens: T[],
  activeFilters: ActiveFilters,
): T[] => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return tokens;
  }

  if (Object.keys(activeFilters).length === 0) {
    return tokens;
  }

  return tokens.filter((token) => tokenMatchesFilters(token, activeFilters));
};

export type {
  ActiveFilters,
  AvailableFilters,
  CollectionTraitMetadataError,
  CollectionTraitMetadataPage,
  FetchCollectionTraitMetadataOptions,
  FetchCollectionTraitMetadataResult,
  FetchCollectionTokensResult,
  PrecomputedFilterData,
  PrecomputedFilterProperty,
  TraitMetadataRow,
  TraitSelection,
};

export {
  aggregateTraitMetadata,
  buildAvailableFilters,
  buildPrecomputedFilters,
  fetchCollectionTraitMetadata,
  filterTokensByMetadata,
  flattenActiveFilters,
  tokenMatchesFilters,
};
