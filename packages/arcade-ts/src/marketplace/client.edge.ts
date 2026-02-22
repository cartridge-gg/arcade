import { addAddressPadding, cairo, getChecksumAddress } from "starknet";
import { fetchToriisSql } from "../modules/torii-sql-fetcher";
import { CategoryType, StatusType } from "../classes";
import { OrderModel } from "../modules/marketplace/order";
import type {
  CollectionListingsOptions,
  CollectionOrdersOptions,
  CollectionSummaryOptions,
  FetchCollectionTokensOptions,
  FetchCollectionTokensResult,
  MarketplaceClient,
  MarketplaceClientConfig,
  MarketplaceFees,
  NormalizedCollection,
  NormalizedToken,
  RoyaltyFee,
  RoyaltyFeeOptions,
  TokenDetails,
  TokenDetailsOptions,
} from "./types";
import {
  defaultResolveContractImage,
  defaultResolveTokenImage,
  inferImageFromMetadata,
  normalizeTokenIds,
  normalizeTokens,
  parseJsonSafe,
} from "./utils";

const DEFAULT_LIMIT = 100;

const statusValueMap: Record<StatusType, number> = {
  [StatusType.None]: 0,
  [StatusType.Placed]: 1,
  [StatusType.Canceled]: 2,
  [StatusType.Executed]: 3,
};

const categoryValueMap: Record<CategoryType, number> = {
  [CategoryType.None]: 0,
  [CategoryType.Buy]: 1,
  [CategoryType.Sell]: 2,
};

const asNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    if (value.startsWith("0x")) return Number(BigInt(value));
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const asBigInt = (value: unknown): bigint => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  if (typeof value === "string" && value.length > 0) return BigInt(value);
  return 0n;
};

const normalizeTokenIdForQuery = (tokenId?: string): string | undefined => {
  if (!tokenId) return undefined;
  try {
    return BigInt(tokenId).toString();
  } catch (_error) {
    return tokenId;
  }
};

const ensureProjectId = (
  projectId: string | undefined,
  fallback: string,
): string => {
  if (projectId && projectId.length > 0) return projectId;
  return fallback;
};

const escapeSqlValue = (value: string): string => value.replace(/'/g, "''");

const extractRows = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.result)) return data.result;
  return [];
};

const toSqlList = (values: string[]): string =>
  values.map((value) => `'${escapeSqlValue(value)}'`).join(", ");

const toPositiveInt = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback;
  const intValue = Math.floor(value);
  if (intValue <= 0) return fallback;
  return intValue;
};

const KEYSET_CURSOR_PREFIX = "keyset:";

const parseTokenCursor = (
  cursor?: string | null | undefined,
): { offset?: number; keysetTokenId?: string } => {
  if (!cursor) return {};
  if (cursor.startsWith(KEYSET_CURSOR_PREFIX)) {
    const tokenId = cursor.slice(KEYSET_CURSOR_PREFIX.length);
    if (!tokenId) return {};
    return { keysetTokenId: tokenId };
  }

  const numericCursor = Number.parseInt(cursor, 10);
  if (Number.isFinite(numericCursor) && `${numericCursor}` === cursor.trim()) {
    return { offset: Math.max(0, numericCursor) };
  }

  return { keysetTokenId: cursor };
};

const encodeKeysetCursor = (tokenId: string): string =>
  `${KEYSET_CURSOR_PREFIX}${tokenId}`;

const buildAttributeFilterSqlClause = (
  collectionAddress: string,
  filters: FetchCollectionTokensOptions["attributeFilters"],
): string | null => {
  if (!filters || Object.keys(filters).length === 0) return null;

  const traitClauses: string[] = [];
  const distinctTraits = new Set<string>();

  for (const [trait, values] of Object.entries(filters)) {
    if (values == null) continue;
    const selectedValues = Array.isArray(values)
      ? values
      : Array.from(values as Iterable<string | number | bigint>);
    const normalizedValues = selectedValues
      .map((value) => String(value))
      .filter((value) => value.length > 0);
    if (normalizedValues.length === 0) continue;

    distinctTraits.add(trait);

    const traitName = escapeSqlValue(trait);
    if (normalizedValues.length === 1) {
      traitClauses.push(
        `(trait_name = '${traitName}' AND trait_value = '${escapeSqlValue(
          normalizedValues[0],
        )}')`,
      );
      continue;
    }

    traitClauses.push(
      `(trait_name = '${traitName}' AND trait_value IN (${toSqlList(
        normalizedValues,
      )}))`,
    );
  }

  if (traitClauses.length === 0) return null;

  return `token_id IN (
  SELECT token_id
  FROM token_attributes
  WHERE token_id LIKE '${escapeSqlValue(collectionAddress)}:%'
    AND (${traitClauses.join(" OR ")})
  GROUP BY token_id
  HAVING COUNT(DISTINCT trait_name) = ${distinctTraits.size}
)`;
};

async function querySql(projectId: string, sql: string): Promise<any[]> {
  const result = await fetchToriisSql([projectId], sql);
  if (result.errors?.length) {
    throw result.errors[0];
  }

  const rows: any[] = [];
  for (const entry of result.data ?? []) {
    rows.push(...extractRows(entry));
  }
  return rows;
}

function toOrderModel(row: any): OrderModel {
  const orderLike = {
    id: asNumber(row.id),
    category: asNumber(row.category),
    status: asNumber(row.status),
    expiration: asNumber(row.expiration),
    collection: String(row.collection ?? "0x0"),
    token_id: asNumber(row.token_id),
    quantity: asNumber(row.quantity),
    price: asNumber(row.price),
    currency: String(row.currency ?? "0x0"),
    owner: String(row.owner ?? "0x0"),
  };

  const identifier =
    typeof row.entity_id === "string"
      ? row.entity_id
      : `${orderLike.id}:${orderLike.collection}:${orderLike.token_id}`;

  return OrderModel.from(identifier, orderLike);
}

async function verifyListingsOwnership(
  projectId: string,
  collectionAddress: string,
  listings: OrderModel[],
): Promise<OrderModel[]> {
  if (!listings.length) return listings;

  const collection = addAddressPadding(
    getChecksumAddress(collectionAddress),
  ).toLowerCase();
  const owners = [
    ...new Set(listings.map((order) => getChecksumAddress(order.owner))),
  ];
  if (owners.length === 0) return [];

  const tokenIds = [
    ...new Set(listings.map((order) => BigInt(order.tokenId).toString())),
  ];
  if (tokenIds.length === 0) return [];

  const ownerList = toSqlList(owners.map((owner) => owner.toLowerCase()));
  const tokenIdList = toSqlList(tokenIds);

  const sql = `SELECT account_address, token_id
FROM token_balances
WHERE contract_address = '${escapeSqlValue(collection)}'
  AND account_address IN (${ownerList})
  AND token_id IN (${tokenIdList})
  AND balance != '0x0000000000000000000000000000000000000000000000000000000000000000'`;

  const rows = await querySql(projectId, sql);
  const ownership = new Set<string>();

  for (const row of rows) {
    const owner = getChecksumAddress(String(row.account_address));
    const tokenId = BigInt(String(row.token_id)).toString();
    ownership.add(`${owner}_${tokenId}`);
  }

  return listings.filter((order) => {
    const owner = getChecksumAddress(order.owner);
    const tokenId = BigInt(order.tokenId).toString();
    return ownership.has(`${owner}_${tokenId}`);
  });
}

export async function createEdgeMarketplaceClient(
  config: MarketplaceClientConfig,
): Promise<MarketplaceClient> {
  const {
    defaultProject = "arcade-main",
    resolveTokenImage,
    resolveContractImage,
    provider,
  } = config;

  const getCollection = async (
    options: CollectionSummaryOptions,
  ): Promise<NormalizedCollection | null> => {
    const { projectId: projectIdInput, address, fetchImages = true } = options;
    const projectId = ensureProjectId(projectIdInput, defaultProject);
    const collection = addAddressPadding(
      getChecksumAddress(address),
    ).toLowerCase();

    const rows = await querySql(
      projectId,
      `SELECT
  tc.contract_address,
  tc.contract_type,
  tc.type,
  COALESCE(
    tc.metadata,
    (SELECT t.metadata FROM tokens t WHERE t.contract_address = tc.contract_address LIMIT 1)
  ) AS metadata,
  tc.total_supply,
  COALESCE(
    tc.token_id,
    (SELECT t.token_id FROM tokens t WHERE t.contract_address = tc.contract_address LIMIT 1)
  ) AS token_id
FROM token_contracts tc
WHERE tc.contract_address = '${escapeSqlValue(collection)}'
LIMIT 1`,
    );

    const contract = rows[0];
    if (!contract) return null;

    const metadata = parseJsonSafe(contract.metadata, contract.metadata);
    let image: string | undefined;

    if (fetchImages) {
      const contractImageResolver =
        resolveContractImage ?? defaultResolveContractImage;
      const maybeImage = await contractImageResolver(contract as any, {
        projectId,
      });
      if (typeof maybeImage === "string" && maybeImage.length > 0) {
        image = maybeImage;
      }
      if (!image) image = inferImageFromMetadata(metadata);
    }

    return {
      projectId,
      address: getChecksumAddress(
        String(contract.contract_address ?? collection),
      ),
      contractType:
        String(contract.contract_type ?? contract.type ?? "ERC721") || "ERC721",
      metadata,
      totalSupply: asBigInt(contract.total_supply ?? "0x0"),
      tokenIdSample: (contract.token_id as string | null | undefined) ?? null,
      image,
      raw: contract as any,
    };
  };

  const listCollectionTokens = async (
    options: FetchCollectionTokensOptions,
  ): Promise<FetchCollectionTokensResult> => {
    const {
      address,
      project,
      cursor,
      attributeFilters,
      tokenIds,
      limit = DEFAULT_LIMIT,
      fetchImages = false,
    } = options;
    const projectId = ensureProjectId(project, defaultProject);
    const collection = addAddressPadding(
      getChecksumAddress(address),
    ).toLowerCase();
    const cursorState = parseTokenCursor(cursor);
    const effectiveLimit = toPositiveInt(limit, DEFAULT_LIMIT);
    const normalizedTokenIds = normalizeTokenIds(tokenIds);

    const conditions = [`contract_address = '${escapeSqlValue(collection)}'`];

    if (normalizedTokenIds.length > 0) {
      const values = [
        ...new Set(normalizedTokenIds.map((value) => escapeSqlValue(value))),
      ];
      conditions.push(
        `token_id IN (${values.map((v) => `'${v}'`).join(", ")})`,
      );
    }

    if (cursorState.keysetTokenId) {
      conditions.push(
        `token_id > '${escapeSqlValue(cursorState.keysetTokenId)}'`,
      );
    }

    const traitClause = buildAttributeFilterSqlClause(
      collection,
      attributeFilters,
    );
    if (traitClause) {
      conditions.push(traitClause);
    }

    const sql = `SELECT contract_address, token_id, metadata, name, symbol, decimals
FROM tokens
WHERE ${conditions.join(" AND ")}
ORDER BY token_id
LIMIT ${effectiveLimit}${
      cursorState.offset != null
        ? `
OFFSET ${cursorState.offset}`
        : ""
    }`;

    try {
      const rows = await querySql(projectId, sql);
      const normalized = await normalizeTokens(rows as any[], projectId, {
        fetchImages,
        resolveTokenImage: resolveTokenImage ?? defaultResolveTokenImage,
      });

      let nextCursor: string | null = null;
      if (rows.length >= effectiveLimit) {
        if (cursorState.offset != null) {
          nextCursor = String(cursorState.offset + rows.length);
        } else {
          const lastRow = rows[rows.length - 1];
          const lastTokenId = lastRow?.token_id;
          if (lastTokenId != null) {
            nextCursor = encodeKeysetCursor(String(lastTokenId));
          }
        }
      }
      return {
        page: {
          tokens: normalized as NormalizedToken[],
          nextCursor,
        },
        error: null,
      };
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error(
              typeof error === "string" ? error : "Failed to list tokens",
            );
      return { page: null, error: { error: err } };
    }
  };

  const getCollectionOrders = async (
    options: CollectionOrdersOptions,
    projectIdOverride?: string,
  ): Promise<OrderModel[]> => {
    const collection = addAddressPadding(
      getChecksumAddress(options.collection),
    ).toLowerCase();
    const tokenId = normalizeTokenIdForQuery(options.tokenId);
    const status =
      options.status != null ? statusValueMap[options.status] : undefined;
    const category =
      options.category != null ? categoryValueMap[options.category] : undefined;

    const normalizedOrderIds = options.orderIds?.length
      ? [
          ...new Set(
            options.orderIds
              .map((id) => Number(id))
              .filter((id) => Number.isInteger(id) && id >= 0),
          ),
        ]
      : [];

    if (options.orderIds?.length && normalizedOrderIds.length === 0) {
      return [];
    }

    const conditions = [`collection = '${escapeSqlValue(collection)}'`];
    if (tokenId !== undefined) {
      conditions.push(`token_id = '${escapeSqlValue(tokenId)}'`);
    }
    if (normalizedOrderIds.length) {
      conditions.push(`id IN (${normalizedOrderIds.join(", ")})`);
    }
    if (status !== undefined) {
      conditions.push(`status = ${status}`);
    }
    if (
      category !== undefined &&
      category !== categoryValueMap[CategoryType.None]
    ) {
      conditions.push(`category = ${category}`);
    }

    const effectiveLimit = toPositiveInt(
      options.limit ?? DEFAULT_LIMIT,
      DEFAULT_LIMIT,
    );
    const sql = `SELECT id, category, status, expiration, collection, token_id, quantity, price, currency, owner
FROM "ARCADE-Order"
WHERE ${conditions.join(" AND ")}
ORDER BY id DESC LIMIT ${effectiveLimit}`;

    const rows = await querySql(projectIdOverride ?? defaultProject, sql);
    return rows.map(toOrderModel).filter((order) => order.exists());
  };

  const listCollectionListings = async (
    options: CollectionListingsOptions,
  ): Promise<OrderModel[]> => {
    const projectId = ensureProjectId(options.projectId, defaultProject);
    const baseOrders = await getCollectionOrders(
      {
        collection: options.collection,
        tokenId: options.tokenId,
        limit: options.limit,
        category: CategoryType.Sell,
        status: StatusType.Placed,
      },
      projectId,
    );

    const filtered = baseOrders.filter(
      (order) =>
        order.category.value === CategoryType.Sell &&
        order.status.value === StatusType.Placed,
    );

    if (options.verifyOwnership === false || filtered.length === 0) {
      return filtered;
    }

    return verifyListingsOwnership(projectId, options.collection, filtered);
  };

  const getToken = async (
    options: TokenDetailsOptions,
  ): Promise<TokenDetails | null> => {
    const {
      collection,
      tokenId,
      projectId: projectOverride,
      fetchImages = true,
      orderLimit,
    } = options;
    const projectId = ensureProjectId(projectOverride, defaultProject);

    const tokenPage = await listCollectionTokens({
      address: collection,
      project: projectId,
      tokenIds: [tokenId],
      limit: 1,
      fetchImages,
    });
    if (tokenPage.error) {
      throw tokenPage.error.error;
    }

    const token = tokenPage.page?.tokens[0];
    if (!token) return null;

    const orders = await getCollectionOrders(
      {
        collection,
        tokenId,
        limit: orderLimit,
      },
      projectId,
    );

    const now = Date.now() / 1000;
    let listings = orders.filter(
      (order) =>
        order.category.value === CategoryType.Sell &&
        order.status.value === StatusType.Placed &&
        order.expiration > now,
    );

    if (listings.length > 0 && options.verifyOwnership !== false) {
      listings = await verifyListingsOwnership(projectId, collection, listings);
    }

    return {
      projectId,
      token,
      orders,
      listings,
    };
  };

  const getFees = async (): Promise<MarketplaceFees | null> => {
    const rows = await querySql(
      defaultProject,
      `SELECT fee_num, fee_receiver
FROM "ARCADE-Book"
LIMIT 1`,
    );

    const row = rows[0];
    if (!row) return null;

    return {
      feeNum: asNumber(row.fee_num),
      feeReceiver: getChecksumAddress(String(row.fee_receiver ?? "0x0")),
      feeDenominator: 10000,
    };
  };

  const getRoyaltyFee = async (
    options: RoyaltyFeeOptions,
  ): Promise<RoyaltyFee | null> => {
    if (!provider) {
      throw new Error(
        "Provider required for getRoyaltyFee. Pass provider in config.",
      );
    }

    const result = await provider.callContract({
      contractAddress: options.collection,
      entrypoint: "royalty_info",
      calldata: [cairo.uint256(options.tokenId), cairo.uint256(options.amount)],
    });

    if (!result || result.length < 2) return null;

    return {
      receiver: getChecksumAddress(result[0]),
      amount: BigInt(result[1]),
    };
  };

  return {
    getCollection,
    listCollectionTokens,
    getCollectionOrders,
    listCollectionListings,
    getToken,
    getFees,
    getRoyaltyFee,
  };
}
