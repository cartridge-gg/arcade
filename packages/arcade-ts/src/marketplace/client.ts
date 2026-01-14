import {
  AndComposeClause,
  ClauseBuilder,
  KeysClause,
  MemberClause,
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
import { initArcadeSDK } from "../modules";
import type { SchemaType } from "../bindings";
import { ArcadeModelsMapping, OrderCategory, OrderStatus } from "../bindings";
import { NAMESPACE } from "../constants";
import { Book } from "../modules/marketplace/book";
import { Order, type OrderModel } from "../modules/marketplace/order";
import { CategoryType, StatusType } from "../classes";
import { fetchCollectionTokens, fetchTokenBalances } from "./tokens";
import {
  defaultResolveContractImage,
  defaultResolveTokenImage,
  inferImageFromMetadata,
  parseJsonSafe,
} from "./utils";
import type {
  CollectionListingsOptions,
  CollectionOrdersOptions,
  CollectionSummaryOptions,
  MarketplaceClient,
  MarketplaceClientConfig,
  MarketplaceFees,
  NormalizedCollection,
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
  if (projectId && projectId.length > 0) {
    return projectId;
  }
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

  if (!contract) {
    return null;
  }

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

export async function createMarketplaceClient(
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

  const queryOrders = async (
    options: CollectionOrdersOptions,
  ): Promise<OrderModel[]> => {
    const checksumCollection = getChecksumAddress(options.collection);
    const tokenId = normalizeTokenIdForQuery(options.tokenId);

    const builders = [
      KeysClause(
        [ArcadeModelsMapping.Order],
        [undefined, addAddressPadding(checksumCollection), tokenId, undefined],
        "FixedLen",
      ),
    ];

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
    const checksumCollection = getChecksumAddress(options.collection);
    const ownerAddresses = [...new Set(filtered.map((o) => o.owner))];
    const tokenIds = [
      ...new Set(
        filtered.map((o) => addAddressPadding(`0x${o.tokenId.toString(16)}`)),
      ),
    ];

    const { page, error } = await fetchTokenBalances({
      project: projectId,
      contractAddresses: [checksumCollection],
      accountAddresses: ownerAddresses,
      tokenIds,
    });

    if (error || !page) {
      throw new Error("Failed to verify listing ownership");
    }

    const ownershipSet = new Set<string>();
    for (const balance of page.balances) {
      if (BigInt(balance.balance) > 0n && balance.token_id) {
        const normalizedOwner = getChecksumAddress(balance.account_address);
        const normalizedTokenId = BigInt(balance.token_id).toString();
        ownershipSet.add(`${normalizedOwner}_${normalizedTokenId}`);
      }
    }

    return filtered.filter((order) => {
      const normalizedOwner = getChecksumAddress(order.owner);
      const normalizedTokenId = BigInt(order.tokenId).toString();
      const key = `${normalizedOwner}_${normalizedTokenId}`;
      return ownershipSet.has(key);
    });
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

    const listings = orders.filter(
      (order) =>
        order.category.value === CategoryType.Sell &&
        order.status.value === StatusType.Placed,
    );

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
    listCollectionTokens: (options) =>
      fetchCollectionTokens({
        ...options,
        project: options.project ?? defaultProject,
        resolveTokenImage: resolveTokenImage ?? defaultResolveTokenImage,
        defaultProjectId: defaultProject,
      }),
    getCollectionOrders,
    listCollectionListings,
    getToken,
    getFees,
    getRoyaltyFee,
  };
}
