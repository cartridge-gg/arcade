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

const tokenMatchesAttributeFilters = (
  token: { metadata?: any },
  filters: FetchCollectionTokensOptions["attributeFilters"],
): boolean => {
  if (!filters || Object.keys(filters).length === 0) return true;
  const metadata = parseJsonSafe(token.metadata, token.metadata);
  const attributes = Array.isArray((metadata as any)?.attributes)
    ? (metadata as any).attributes
    : [];
  if (!attributes.length) return false;

  const traitMap = new Map<string, Set<string>>();
  for (const attribute of attributes) {
    const trait = attribute?.trait_type;
    const value = attribute?.value;
    if (trait == null || value == null) continue;
    const traitName = String(trait);
    if (!traitMap.has(traitName)) traitMap.set(traitName, new Set());
    traitMap.get(traitName)?.add(String(value));
  }

  for (const [trait, values] of Object.entries(filters)) {
    if (values == null) continue;
    const selected = Array.isArray(values) ? values : Array.from(values as any);
    const available = traitMap.get(trait);
    if (!available) return false;
    const matched = selected.some((value) => available.has(String(value)));
    if (!matched) return false;
  }

  return true;
};

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

  const collection = addAddressPadding(getChecksumAddress(collectionAddress));
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

  const sql = `SELECT account_address, token_id, balance
FROM token_balances
WHERE lower(contract_address) = lower('${escapeSqlValue(collection)}')
  AND lower(account_address) IN (${ownerList})
  AND token_id IN (${tokenIdList})`;

  const rows = await querySql(projectId, sql);
  const ownership = new Set<string>();

  for (const row of rows) {
    const balance = asBigInt(row.balance ?? 0);
    if (balance <= 0n) continue;
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
    const collection = addAddressPadding(getChecksumAddress(address));

    const rows = await querySql(
      projectId,
      `SELECT contract_address, contract_type, type, metadata, total_supply, token_id
FROM token_contracts
WHERE lower(contract_address) = lower('${escapeSqlValue(collection)}')
LIMIT 1`,
    );

    const contract = rows[0];
    if (!contract) return null;

    let tokenSample: any | undefined;
    let metadataRaw = contract.metadata;
    if (!metadataRaw) {
      const tokenRows = await querySql(
        projectId,
        `SELECT token_id, metadata
FROM tokens
WHERE lower(contract_address) = lower('${escapeSqlValue(collection)}')
LIMIT 1`,
      );
      tokenSample = tokenRows[0];
      if (tokenSample?.metadata) metadataRaw = tokenSample.metadata;
    }

    const metadata = parseJsonSafe(metadataRaw, metadataRaw);
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
      tokenIdSample:
        (contract.token_id as string | null | undefined) ??
        (tokenSample?.token_id as string | null | undefined) ??
        null,
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
    const collection = addAddressPadding(getChecksumAddress(address));
    const offset = cursor ? Number.parseInt(cursor, 10) || 0 : 0;

    const conditions = [
      `lower(contract_address) = lower('${escapeSqlValue(collection)}')`,
    ];

    if (tokenIds && tokenIds.length > 0) {
      const values = [
        ...new Set(tokenIds.map((value) => escapeSqlValue(value))),
      ];
      conditions.push(
        `token_id IN (${values.map((v) => `'${v}'`).join(", ")})`,
      );
    }

    const sql = `SELECT contract_address, token_id, metadata, name, symbol, decimals
FROM tokens
WHERE ${conditions.join(" AND ")}
ORDER BY token_id
LIMIT ${Math.max(1, Math.floor(limit))}
OFFSET ${Math.max(0, offset)}`;

    try {
      const rows = await querySql(projectId, sql);
      const normalized = await normalizeTokens(rows as any[], projectId, {
        fetchImages,
        resolveTokenImage: resolveTokenImage ?? defaultResolveTokenImage,
      });

      const filtered = normalized.filter((token) =>
        tokenMatchesAttributeFilters(token, attributeFilters),
      ) as NormalizedToken[];

      const nextCursor =
        rows.length >= limit ? String(offset + rows.length) : null;
      return {
        page: {
          tokens: filtered,
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
  ): Promise<OrderModel[]> => {
    const collection = addAddressPadding(
      getChecksumAddress(options.collection),
    );
    const tokenId = normalizeTokenIdForQuery(options.tokenId);
    const status =
      options.status != null ? statusValueMap[options.status] : undefined;
    const category =
      options.category != null ? categoryValueMap[options.category] : undefined;

    const conditions = [
      `lower(collection) = lower('${escapeSqlValue(collection)}')`,
    ];
    if (tokenId !== undefined) {
      conditions.push(`token_id = '${escapeSqlValue(tokenId)}'`);
    }
    if (options.orderIds?.length) {
      conditions.push(
        `id IN (${options.orderIds.map((id) => Number(id)).join(", ")})`,
      );
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

    const sql = `SELECT id, category, status, expiration, collection, token_id, quantity, price, currency, owner
FROM "ARCADE-Order"
WHERE ${conditions.join(" AND ")}
ORDER BY id DESC${options.limit ? ` LIMIT ${Math.max(1, Math.floor(options.limit))}` : ""}`;

    const rows = await querySql(defaultProject, sql);
    return rows.map(toOrderModel).filter((order) => order.exists());
  };

  const listCollectionListings = async (
    options: CollectionListingsOptions,
  ): Promise<OrderModel[]> => {
    const baseOrders = await getCollectionOrders({
      collection: options.collection,
      tokenId: options.tokenId,
      limit: options.limit,
      category: CategoryType.Sell,
      status: StatusType.Placed,
    });

    const filtered = baseOrders.filter(
      (order) =>
        order.category.value === CategoryType.Sell &&
        order.status.value === StatusType.Placed,
    );

    if (options.verifyOwnership === false || filtered.length === 0) {
      return filtered;
    }

    const projectId = ensureProjectId(options.projectId, defaultProject);
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

    const orders = await getCollectionOrders({
      collection,
      tokenId,
      limit: orderLimit,
    });

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
