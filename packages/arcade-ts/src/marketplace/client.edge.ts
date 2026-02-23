import {
  AndComposeClause,
  ClauseBuilder,
  KeysClause,
  MemberClause,
  OrComposeClause,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import type { constants } from "starknet";
import { addAddressPadding, cairo, getChecksumAddress } from "starknet";
import type {
  ToriiClient,
  Token as ToriiToken,
} from "@dojoengine/torii-wasm/types";
import {
  fetchToriis,
  type ClientCallbackParams,
} from "../modules/torii-fetcher";
import { initArcadeSDK } from "../modules/init-sdk";
import type { SchemaType } from "../bindings";
import { ArcadeModelsMapping, OrderCategory, OrderStatus } from "../bindings";
import { NAMESPACE } from "../constants";
import { Book } from "../modules/marketplace/book";
import { Order, type OrderModel } from "../modules/marketplace/order";
import { CategoryType, StatusType } from "../classes";
import { fetchCollectionTokens, fetchTokenBalances } from "./tokens";
import {
  canonicalizeTokenId,
  defaultResolveContractImage,
  defaultResolveTokenImage,
  inferImageFromMetadata,
  normalizeTokenIds,
  parseJsonSafe,
} from "./utils";
import type {
  CollectionTokenMetadataBatchOptions,
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

type TokenContractsResponse = Awaited<
  ReturnType<ToriiClient["getTokenContracts"]>
>;

const statusMap: Record<StatusType, OrderStatus> = {
  [StatusType.None]: OrderStatus.None,
  [StatusType.Placed]: OrderStatus.Placed,
  [StatusType.Canceled]: OrderStatus.Canceled,
  [StatusType.Executed]: OrderStatus.Executed,
};

const categoryMap: Record<CategoryType, OrderCategory> = {
  [CategoryType.None]: OrderCategory.None,
  [CategoryType.Buy]: OrderCategory.Buy,
  [CategoryType.Sell]: OrderCategory.Sell,
};

const normalizeTokenIdForQuery = (tokenId?: string): string | undefined => {
  if (!tokenId) return undefined;
  return canonicalizeTokenId(tokenId) ?? undefined;
};

const ensureProjectId = (
  projectId: string | undefined,
  fallback: string,
): string => {
  if (projectId && projectId.length > 0) return projectId;
  return fallback;
};

async function fetchContractMetadata(
  projectId: string,
  address: string,
  resolveContractImage: MarketplaceClientConfig["resolveContractImage"],
  fetchImages: boolean,
): Promise<NormalizedCollection | null> {
  const checksumAddress = getChecksumAddress(address);

  const response = await fetchToriis([projectId], {
    client: async ({ client }: ClientCallbackParams) => {
      return client.getTokenContracts({
        contract_addresses: [checksumAddress],
        contract_types: [],
        pagination: {
          limit: 1,
          cursor: undefined,
          direction: "Forward",
          order_by: [],
        },
      });
    },
  });

  const contractPages = response.data as TokenContractsResponse[];
  const contract = contractPages
    .flatMap((page) => page.items)
    .find(
      (item) => getChecksumAddress(item.contract_address) === checksumAddress,
    );

  if (!contract) return null;

  let tokenSample: ToriiToken | undefined;

  if (!contract.metadata || contract.metadata.length === 0) {
    try {
      const tokensResponse = await fetchToriis([projectId], {
        client: async ({ client }: ClientCallbackParams) => {
          return client.getTokens({
            contract_addresses: [checksumAddress],
            token_ids: [],
            attribute_filters: [],
            pagination: {
              limit: 1,
              cursor: undefined,
              direction: "Forward",
              order_by: [],
            },
          });
        },
      });

      const tokenPages = tokensResponse.data as Awaited<
        ReturnType<ToriiClient["getTokens"]>
      >[];
      tokenSample = tokenPages.flatMap((page) => page.items)[0];
      if (tokenSample?.metadata && !contract.metadata) {
        contract.metadata = tokenSample.metadata;
      }
      if (tokenSample?.token_id && !(contract as any).token_id) {
        (contract as any).token_id = tokenSample.token_id;
      }
    } catch (_error) {
      // Silently ignore token metadata enrichment failures
    }
  }

  const metadata = parseJsonSafe(contract.metadata, contract.metadata);
  const totalSupply = BigInt(contract.total_supply ?? "0x0");
  const contractType =
    (contract as any).contract_type ?? (contract as any).type ?? "ERC721";

  let image: string | undefined;
  if (fetchImages) {
    const contractImageResolver =
      resolveContractImage ?? defaultResolveContractImage;
    const maybeImage = await contractImageResolver(contract, { projectId });
    if (typeof maybeImage === "string" && maybeImage.length > 0) {
      image = maybeImage;
    }
    if (!image) {
      image = inferImageFromMetadata(metadata);
    }
  }

  return {
    projectId,
    address: checksumAddress,
    contractType,
    metadata,
    totalSupply,
    tokenIdSample: (contract as any).token_id ?? tokenSample?.token_id ?? null,
    image,
    raw: contract,
  };
}

async function verifyListingsOwnership(
  projectId: string,
  collectionAddress: string,
  listings: OrderModel[],
): Promise<OrderModel[]> {
  if (!listings.length) return listings;

  const checksumCollection = getChecksumAddress(collectionAddress);
  const ownerAddresses = [
    ...new Set(listings.map((order) => getChecksumAddress(order.owner))),
  ];
  if (ownerAddresses.length === 0) return [];

  const tokenIds = [
    ...new Set(
      listings.map((o) => addAddressPadding(`0x${o.tokenId.toString(16)}`)),
    ),
  ];
  if (tokenIds.length === 0) return [];

  const { page, error } = await fetchTokenBalances({
    project: projectId,
    contractAddresses: [checksumCollection],
    accountAddresses: ownerAddresses,
    tokenIds,
  });

  if (error || !page) return [];

  const ownership = new Set<string>();
  for (const balance of page.balances) {
    if (BigInt(balance.balance) > 0n && balance.token_id) {
      const owner = getChecksumAddress(balance.account_address);
      const tokenId = BigInt(balance.token_id).toString();
      ownership.add(`${owner}_${tokenId}`);
    }
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
    chainId,
    defaultProject = "arcade-main",
    resolveTokenImage,
    resolveContractImage,
    provider,
  } = config;

  const sdk = await initArcadeSDK(chainId as constants.StarknetChainId);

  const getCollection = async (
    options: CollectionSummaryOptions,
  ): Promise<NormalizedCollection | null> => {
    const { projectId: projectIdInput, address, fetchImages = true } = options;
    const projectId = ensureProjectId(projectIdInput, defaultProject);

    return fetchContractMetadata(
      projectId,
      address,
      resolveContractImage,
      fetchImages,
    );
  };

  const listCollectionTokens = async (
    options: FetchCollectionTokensOptions,
  ): Promise<FetchCollectionTokensResult> => {
    return fetchCollectionTokens({
      ...options,
      project: options.project ?? defaultProject,
      resolveTokenImage: resolveTokenImage ?? defaultResolveTokenImage,
      defaultProjectId: defaultProject,
    });
  };

  const getCollectionTokenMetadataBatch = async (
    options: CollectionTokenMetadataBatchOptions,
  ): Promise<NormalizedToken[]> => {
    const projectId = ensureProjectId(options.project, defaultProject);
    const normalizedTokenIds = [
      ...new Set(normalizeTokenIds(options.tokenIds)),
    ];
    if (normalizedTokenIds.length === 0) {
      return [];
    }

    const { page, error } = await fetchCollectionTokens({
      address: options.address,
      project: projectId,
      tokenIds: normalizedTokenIds,
      limit: normalizedTokenIds.length,
      includeMetadata: true,
      fetchImages: options.fetchImages ?? false,
      resolveTokenImage: resolveTokenImage ?? defaultResolveTokenImage,
      defaultProjectId: defaultProject,
    });
    if (error) {
      throw error.error;
    }

    const tokensById = new Map<string, NormalizedToken>();
    for (const token of page?.tokens ?? []) {
      const canonicalId = canonicalizeTokenId(String(token.token_id ?? ""));
      if (!canonicalId) continue;
      if (!tokensById.has(canonicalId)) {
        tokensById.set(canonicalId, token);
      }
    }

    return normalizedTokenIds
      .map((tokenId) => tokensById.get(tokenId))
      .filter((token): token is NormalizedToken => Boolean(token));
  };

  const queryOrders = async (
    options: CollectionOrdersOptions,
  ): Promise<OrderModel[]> => {
    const checksumCollection = getChecksumAddress(options.collection);
    const tokenId = normalizeTokenIdForQuery(options.tokenId);
    const orderIds = options.orderIds ?? [];

    let baseClause:
      | ReturnType<typeof KeysClause>
      | ReturnType<typeof OrComposeClause>;

    if (orderIds.length > 0) {
      const orderIdClauses = orderIds.map((id) =>
        KeysClause(
          [ArcadeModelsMapping.Order],
          [
            id.toString(),
            addAddressPadding(checksumCollection),
            tokenId,
            undefined,
          ],
          "FixedLen",
        ),
      );
      baseClause =
        orderIdClauses.length === 1
          ? orderIdClauses[0]
          : OrComposeClause(orderIdClauses);
    } else {
      baseClause = KeysClause(
        [ArcadeModelsMapping.Order],
        [undefined, addAddressPadding(checksumCollection), tokenId, undefined],
        "FixedLen",
      );
    }

    const builders: Array<
      | ReturnType<typeof KeysClause>
      | ReturnType<typeof MemberClause>
      | ReturnType<typeof OrComposeClause>
    > = [baseClause];

    const status =
      options.status != null ? statusMap[options.status] : undefined;
    if (status !== undefined) {
      builders.push(
        MemberClause(
          ArcadeModelsMapping.Order,
          "status",
          "Eq",
          status.toString(),
        ),
      );
    }

    const category =
      options.category != null ? categoryMap[options.category] : undefined;
    if (category !== undefined && category !== OrderCategory.None) {
      builders.push(
        MemberClause(
          ArcadeModelsMapping.Order,
          "category",
          "Eq",
          category.toString(),
        ),
      );
    }

    const query = new ToriiQueryBuilder<SchemaType>()
      .withClause(
        builders.length === 1
          ? builders[0].build()
          : AndComposeClause(builders).build(),
      )
      .withEntityModels([ArcadeModelsMapping.Order])
      .includeHashedKeys();

    if (options.limit) {
      query.withLimit(options.limit);
    }

    const entities = await sdk.getEntities({ query });
    const items = entities?.getItems() ?? [];

    const orders: OrderModel[] = [];
    for (const entity of items) {
      const model = entity.models[NAMESPACE]?.[Order.getModelName()];
      if (!model) continue;
      const order = Order.parse(entity);
      if (order.exists()) {
        orders.push(order);
      }
    }

    return orders;
  };

  const getCollectionOrders = async (
    options: CollectionOrdersOptions,
  ): Promise<OrderModel[]> => {
    return queryOrders(options);
  };

  const listCollectionListings = async (
    options: CollectionListingsOptions,
  ): Promise<OrderModel[]> => {
    const baseOrders = await queryOrders({
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
    const { page, error } = await fetchCollectionTokens({
      address: collection,
      project: projectId,
      tokenIds: [tokenId],
      limit: 1,
      fetchImages,
      resolveTokenImage: resolveTokenImage ?? defaultResolveTokenImage,
      defaultProjectId: defaultProject,
    });

    if (error) {
      throw error.error;
    }

    const token = page?.tokens[0];
    if (!token) return null;

    const orders = await queryOrders({
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
    const clauses = new ClauseBuilder().keys(
      [`${NAMESPACE}-${Book.getModelName()}`],
      [],
    );
    const query = new ToriiQueryBuilder<SchemaType>()
      .withClause(clauses.build())
      .withEntityModels([`${NAMESPACE}-${Book.getModelName()}`])
      .includeHashedKeys();

    const entities = await sdk.getEntities({ query });
    const items = entities?.getItems() ?? [];

    for (const entity of items) {
      const book = Book.parse(entity);
      if (book.exists()) {
        return {
          feeNum: book.fee_num,
          feeReceiver: book.fee_receiver,
          feeDenominator: 10000,
        };
      }
    }
    return null;
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
    getCollectionTokenMetadataBatch,
    getCollectionOrders,
    listCollectionListings,
    getToken,
    getFees,
    getRoyaltyFee,
  };
}
