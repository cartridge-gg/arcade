import { Atom } from "@effect-atom/atom-react";
import { Array as A, pipe } from "effect";
import type {
  BookModel,
  OrderModel,
  ListingEvent,
  SaleEvent,
} from "@cartridge/arcade";
import { CategoryType, StatusType } from "@cartridge/arcade";
import { erc20Metadata } from "@cartridge/presets";
import {
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from "@cartridge/ui/utils";
import { getCachedChecksumAddress } from "@/lib/shared/marketplace/utils";
import { addAddressPadding } from "starknet";
import { arcadeAtom } from "./arcade";
import { pricesAtom } from "./prices";
import { collectionOwnershipAtom, type OwnershipMap } from "./owner-filter";
import type { ArcadeEntityItem, ArcadeEventItem } from "../layers/arcade";

const erc20MetadataByAddress = new Map(
  erc20Metadata.map((item) => [
    getCachedChecksumAddress(item.l2_token_address),
    item,
  ]),
);

const getErc20Decimals = (currency: string): number => {
  const checksum = getCachedChecksumAddress(currency);
  return erc20MetadataByAddress.get(checksum)?.decimals ?? 0;
};

const isUsdCurrency = (currency: string): boolean => {
  const checksum = getCachedChecksumAddress(currency);
  return (
    checksum === getCachedChecksumAddress(USDC_CONTRACT_ADDRESS) ||
    checksum === getCachedChecksumAddress(USDT_CONTRACT_ADDRESS)
  );
};

export type OrdersState = {
  [collection: string]: { [token: string]: { [order: string]: OrderModel } };
};

export type ListingsState = {
  [collection: string]: {
    [token: string]: { [listing: string]: OrderModel };
  };
};

export type SalesState = {
  [collection: string]: { [token: string]: { [sale: string]: OrderModel } };
};

type ArcadeMarketModels = {
  Book?: ArcadeEntityItem & { type: "book"; data: BookModel };
  Order?: ArcadeEntityItem & { type: "order"; data: OrderModel };
  Listing?: ArcadeEventItem & { type: "listing"; data: ListingEvent };
  Sale?: ArcadeEventItem & { type: "sale"; data: SaleEvent };
};

const getArcadeMarketModels = (entity: {
  models?: Record<string, unknown>;
}): ArcadeMarketModels | undefined =>
  entity.models?.ARCADE as ArcadeMarketModels | undefined;

export const bookAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return null;

  const bookEntity = result.value.items.find(
    (entity) => getArcadeMarketModels(entity)?.Book !== undefined,
  );

  return bookEntity ? getArcadeMarketModels(bookEntity)!.Book!.data : null;
});

export const ordersAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return {};

  const orders = pipe(
    result.value.items,
    A.filter((entity) => getArcadeMarketModels(entity)?.Order !== undefined),
    A.map((entity) => getArcadeMarketModels(entity)!.Order!.data),
    A.filter((order) => order.category.value === CategoryType.Sell),
  );

  return orders.reduce<OrdersState>((acc, order) => {
    const collection = getCachedChecksumAddress(order.collection);
    const token = order.tokenId.toString();
    if (!acc[collection]) acc[collection] = {};
    if (!acc[collection][token]) acc[collection][token] = {};
    acc[collection][token][order.id] = order;
    return acc;
  }, {});
});

export const buyOrdersAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return {};

  const orders = pipe(
    result.value.items,
    A.filter((entity) => getArcadeMarketModels(entity)?.Order !== undefined),
    A.map((entity) => getArcadeMarketModels(entity)!.Order!.data),
    A.filter((order) => order.category.value === CategoryType.Buy),
  );

  return orders.reduce<OrdersState>((acc, order) => {
    const collection = getCachedChecksumAddress(order.collection);
    const token = order.tokenId.toString();
    if (!acc[collection]) acc[collection] = {};
    if (!acc[collection][token]) acc[collection][token] = {};
    acc[collection][token][order.id] = order;
    return acc;
  }, {});
});

export const listingsAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return {};
  const now = new Date().getTime() / 1000;

  const listings = pipe(
    result.value.items,
    A.filter((entity) => getArcadeMarketModels(entity)?.Order !== undefined),
    A.map((entity) => getArcadeMarketModels(entity)!.Order!.data),
    A.filter((order) => order.category.value === CategoryType.Sell),
    A.filter((order) => order.status.value === StatusType.Placed),
    A.filter((order) => order.expiration > now),
  );

  return listings.reduce<ListingsState>((acc, listing) => {
    const order = listing;
    const collection = getCachedChecksumAddress(order.collection);
    const token = order.tokenId.toString();
    if (!acc[collection]) acc[collection] = {};
    if (!acc[collection][token]) acc[collection][token] = {};
    acc[collection][token][order.id] = listing;
    return acc;
  }, {});
});

export const salesAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return {};

  const sales = pipe(
    result.value.items,
    A.filter((entity) => getArcadeMarketModels(entity)?.Order !== undefined),
    A.map((entity) => getArcadeMarketModels(entity)!.Order!.data),
    A.filter((order) => order.category.value === CategoryType.Sell),
    A.filter((order) => order.status.value === StatusType.Executed),
  );

  return sales.reduce<SalesState>((acc, order) => {
    const collection = getCachedChecksumAddress(order.collection);
    const token = order.tokenId.toString();
    if (!acc[collection]) acc[collection] = {};
    if (!acc[collection][token]) acc[collection][token] = {};
    acc[collection][token][order.id] = order;
    return acc;
  }, {});
});

export const collectionOrdersAtom = Atom.family((contractAddress: string) => {
  return Atom.make((get) => {
    const listings = get(listingsAtom);
    const collection = getCachedChecksumAddress(contractAddress);
    const collectionOrders = listings[collection];
    if (!collectionOrders) return {};

    return Object.entries(collectionOrders).reduce(
      (acc, [token, tokenOrders]) => {
        const filtered = Object.values(tokenOrders).filter(
          (order) => !!order && order.status.value === StatusType.Placed,
        );
        if (filtered.length === 0) return acc;
        acc[token] = filtered;
        return acc;
      },
      {} as { [token: string]: OrderModel[] },
    );
  });
});

export const tokenOrdersAtom = Atom.family((key: string) => {
  const { contractAddress, tokenId } = JSON.parse(key) as {
    contractAddress: string;
    tokenId: string;
  };

  return Atom.make((get) => {
    const orders = get(ordersAtom);
    const collection = getCachedChecksumAddress(contractAddress);
    const collectionOrders = orders[collection];
    if (!collectionOrders) return [];

    const token = BigInt(tokenId).toString();
    return Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
  });
});

export const orderAtom = Atom.family((key: string) => {
  const { contractAddress, tokenId } = JSON.parse(key) as {
    contractAddress: string;
    tokenId: string;
  };

  return Atom.make((get) => {
    const orders = get(ordersAtom);
    const collection = getCachedChecksumAddress(contractAddress);
    const collectionOrders = orders[collection];
    if (!collectionOrders) return undefined;

    const token = BigInt(tokenId).toString();
    const tokenOrders = Object.values(collectionOrders[token] || {}).filter(
      (order) => order.status.value === StatusType.Placed,
    );
    return tokenOrders.length > 0 ? tokenOrders[0] : undefined;
  });
});

export const marketplaceFeeAtom = Atom.family((amount: number) => {
  return Atom.make((get) => {
    const book = get(bookAtom);
    if (!book) return 0;
    return (book.fee_num * amount) / 10000;
  });
});

export type UsdPriceMapping = {
  [currencyAddress: string]: number;
};

export type ListingWithUsd = {
  order: OrderModel;
  usdPrice: number | null;
  normalizedPrice: number | null;
};

export type ListingsWithUsdState = {
  [collection: string]: {
    [token: string]: { [listing: string]: ListingWithUsd };
  };
};

export const currencyAddressesAtom = Atom.make((get) => {
  const result = get(arcadeAtom);
  if (result._tag !== "Success") return [];

  const currencies = new Set<string>();
  result.value.items.forEach((entity) => {
    const order = getArcadeMarketModels(entity)?.Order?.data;
    if (order) currencies.add(order.currency);
  });
  return Array.from(currencies);
});

export const usdPriceMappingAtom = Atom.make((get) => {
  const addresses = get(currencyAddressesAtom);
  if (addresses.length === 0) return {};

  const pricesResult = get(pricesAtom(addresses));
  if (pricesResult._tag !== "Success") return {};

  return pricesResult.value.reduce<UsdPriceMapping>((acc, price) => {
    const normalized = Number(price.amount) / 10 ** price.decimals;
    acc[getCachedChecksumAddress(price.base)] = normalized;
    return acc;
  }, {});
});

const orderWithUsd = (order: OrderModel, usdMapping: UsdPriceMapping) => {
  const isUsd = isUsdCurrency(order.currency);
  const usdPricePerUnit = isUsd ? 1 : usdMapping[order.currency];
  const decimals = getErc20Decimals(order.currency);
  const normalizedPrice = order.price / 10 ** decimals;
  return {
    order,
    usdPrice: isUsd
      ? normalizedPrice
      : usdPricePerUnit
        ? normalizedPrice * usdPricePerUnit
        : null,
    normalizedPrice,
  };
};

export const listingsWithUsdAtom = Atom.make((get) => {
  const listings = get(listingsAtom);
  const usdMapping = get(usdPriceMappingAtom);

  const result: ListingsWithUsdState = {};

  for (const [collection, tokens] of Object.entries(listings)) {
    result[collection] = {};
    for (const [token, orders] of Object.entries(tokens)) {
      result[collection][token] = {};
      for (const [orderId, order] of Object.entries(orders)) {
        result[collection][token][orderId] = orderWithUsd(order, usdMapping);
      }
    }
  }

  return result;
});

export const collectionOrdersWithUsdAtom = Atom.family(
  (contractAddress: string) => {
    return Atom.make((get) => {
      const listings = get(listingsWithUsdAtom);
      const collection = getCachedChecksumAddress(contractAddress);
      const collectionListings = listings[collection];
      if (!collectionListings) return {};

      return Object.entries(collectionListings).reduce(
        (acc, [token, tokenListings]) => {
          const filtered = Object.values(tokenListings).filter(
            (listing) =>
              !!listing && listing.order.status.value === StatusType.Placed,
          );
          if (filtered.length === 0) return acc;
          acc[token] = filtered;
          return acc;
        },
        {} as { [token: string]: ListingWithUsd[] },
      );
    });
  },
);

export const sortedListedTokenIdsAtom = Atom.family(
  (contractAddress: string) => {
    return Atom.make((get) => {
      const collectionOrders = get(
        collectionOrdersWithUsdAtom(contractAddress),
      );
      if (!collectionOrders || Object.keys(collectionOrders).length === 0) {
        return [];
      }

      const tokenPrices = Object.entries(collectionOrders).map(
        ([tokenId, listings]) => {
          const minUsdPrice = Math.min(
            ...listings.map((l) => l.usdPrice ?? Number.POSITIVE_INFINITY),
          );
          return { tokenId, minUsdPrice };
        },
      );

      tokenPrices.sort((a, b) => a.minUsdPrice - b.minUsdPrice);

      return tokenPrices.map((t) => t.tokenId);
    });
  },
);

const extractOwnerAddresses = (
  listings: { [token: string]: ListingWithUsd[] } | undefined,
): string[] => {
  if (!listings) return [];
  const owners = new Set<string>();
  for (const tokenListings of Object.values(listings)) {
    for (const listing of tokenListings) {
      owners.add(listing.order.owner);
    }
  }
  return Array.from(owners);
};

const filterListingsByOwnership = (
  listings: { [token: string]: ListingWithUsd[] },
  ownershipMap: OwnershipMap,
): { [token: string]: ListingWithUsd[] } => {
  return Object.entries(listings).reduce(
    (acc, [tokenId, tokenListings]) => {
      const verified = tokenListings.filter((listing) => {
        const ownerKey = addAddressPadding(listing.order.owner).toLowerCase();
        const ownerTokens = ownershipMap.get(ownerKey);
        if (!ownerTokens) return false;
        const normalizedTokenId = BigInt(listing.order.tokenId).toString(16);
        return ownerTokens.has(normalizedTokenId);
      });

      if (verified.length > 0) {
        acc[tokenId] = verified;
      }
      return acc;
    },
    {} as { [token: string]: ListingWithUsd[] },
  );
};

export const verifiedCollectionOrdersAtom = Atom.family(
  (contractAddress: string) => {
    return Atom.make((get) => {
      const listings = get(collectionOrdersWithUsdAtom(contractAddress));
      if (!listings || Object.keys(listings).length === 0) {
        return {};
      }

      const ownerAddresses = extractOwnerAddresses(listings);
      if (ownerAddresses.length === 0) {
        return {};
      }

      const ownershipAtom = collectionOwnershipAtom(
        contractAddress,
        ownerAddresses,
      );
      const ownershipResult = get(ownershipAtom as any) as {
        _tag: string;
        value?: OwnershipMap;
      };

      if (ownershipResult._tag !== "Success" || !ownershipResult.value) {
        return {};
      }

      return filterListingsByOwnership(listings, ownershipResult.value);
    });
  },
);

export const orderWithUsdAtom = Atom.family((order: OrderModel | null) => {
  return Atom.make((get) => {
    const usdMapping = get(usdPriceMappingAtom);
    return order ? orderWithUsd(order, usdMapping) : null;
  });
});
