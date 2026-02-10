import { getChecksumAddress } from "starknet";
import { erc20Metadata } from "@cartridge/presets";
import makeBlockie from "ethereum-blockies-base64";
import type { OrderModel } from "@cartridge/arcade";
import { getDuration } from "@/lib/helpers";

const CHECKSUM_CACHE_KEY = "arcade-checksum-cache";
let checksumCache: Map<string, string> | null = null;

const loadCache = (): Map<string, string> => {
  if (checksumCache) return checksumCache;
  try {
    const stored = localStorage.getItem(CHECKSUM_CACHE_KEY);
    checksumCache = stored ? new Map(JSON.parse(stored)) : new Map();
  } catch {
    checksumCache = new Map();
  }
  return checksumCache;
};

const saveCache = (cache: Map<string, string>) => {
  try {
    localStorage.setItem(CHECKSUM_CACHE_KEY, JSON.stringify([...cache]));
  } catch {
    // Silently fail on quota exceeded or other errors
  }
};

export const getCachedChecksumAddress = (address: string): string => {
  const cache = loadCache();
  const cached = cache.get(address);
  if (cached) return cached;
  const checksum = getChecksumAddress(address);
  cache.set(address, checksum);
  saveCache(cache);
  return checksum;
};

const erc20MetadataByAddress = new Map(
  erc20Metadata.map((item) => [
    getChecksumAddress(item.l2_token_address),
    item,
  ]),
);

const normalizePrice = (currency: string, rawValue: number): number => {
  const checksum = getCachedChecksumAddress(currency);
  const metadata = erc20MetadataByAddress.get(checksum);
  return rawValue / 10 ** (metadata?.decimals ?? 0);
};

export interface MarketplacePriceInfo {
  value: string;
  image: string;
}

export const formatPriceInfo = (
  currencyAddress: string,
  rawValue: number,
  fallbackDecimals = 0,
  roundingDecimals = 4,
  trimDecimals = false,
): MarketplacePriceInfo => {
  const checksumCurrency = getCachedChecksumAddress(currencyAddress);
  const metadata = erc20MetadataByAddress.get(checksumCurrency);

  const image = metadata?.logo_url || makeBlockie(currencyAddress);
  const decimals = metadata?.decimals ?? fallbackDecimals;
  const normalizedValue = rawValue / 10 ** decimals;

  let value = normalizedValue.toFixed(roundingDecimals);
  if (trimDecimals) {
    value = value.replace(/\.?0+$/, "");
  }

  return {
    value,
    image,
  };
};

type SupportedOrderShape =
  | Record<string, OrderModel[]>
  | Record<string, Record<string, OrderModel | null>>
  | undefined;

export const deriveBestPrice = (collectionOrders: SupportedOrderShape) => {
  if (!collectionOrders) return null;

  const listings = Object.values(collectionOrders).flatMap((ordersByToken) =>
    Array.isArray(ordersByToken)
      ? ordersByToken.filter((order): order is OrderModel => Boolean(order))
      : Object.values(ordersByToken).filter((order): order is OrderModel =>
          Boolean(order),
        ),
  );

  if (listings.length === 0) return null;

  const withNormalized = listings.map((order) => ({
    order,
    normalizedPrice: normalizePrice(order.currency, order.price),
  }));

  withNormalized.sort((a, b) => a.normalizedPrice - b.normalizedPrice);

  const cheapest = withNormalized[0]?.order;
  if (!cheapest) return null;

  return formatPriceInfo(cheapest.currency, cheapest.price);
};

export const deriveLatestSalePrice = (
  sales: Record<string, Record<string, OrderModel>> | undefined,
) => {
  if (!sales) return null;

  const orderedSales = Object.values(sales)
    .flatMap((byToken) => {
      return Object.values(byToken).sort((a, b) => b.id - a.id);
    })
    .sort((a, b) => b.id - a.id);

  if (orderedSales.length === 0) return null;

  const latest = orderedSales[0];
  if (!latest) return null;

  return formatPriceInfo(latest.currency, latest.price);
};

export const deriveLatestSalePriceForToken = (
  sales: Record<string, OrderModel> | undefined,
) => {
  if (!sales) return null;

  const orderedSales = Object.values(sales).sort((a, b) => b.id - a.id);
  if (orderedSales.length === 0) return null;

  const latest = orderedSales[0];
  if (!latest) return null;

  return formatPriceInfo(latest.currency, latest.price);
};

export const comparePrices = (
  a: { currency: string; value: number },
  b: { currency: string; value: number },
): number => {
  return (
    normalizePrice(a.currency, a.value) - normalizePrice(b.currency, b.value)
  );
};

export const formatExpirationDate = (
  expiration: number | undefined,
  detailed?: boolean,
): {
  duration: string;
  dateTime: string;
} => {
  if (!expiration)
    return {
      duration: "",
      dateTime: "",
    };
  const date = new Date(Number(expiration) * 1000);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) {
    return {
      duration: "-",
      dateTime: "Expired",
    };
  }
  return {
    duration: getDuration(diff, detailed),
    dateTime: `${date.toString()}`,
  };
};
