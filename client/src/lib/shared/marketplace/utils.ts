import { getChecksumAddress } from "starknet";
import { erc20Metadata } from "@cartridge/presets";
import makeBlockie from "ethereum-blockies-base64";
import type { OrderModel, SaleEvent } from "@cartridge/arcade";

export interface MarketplacePriceInfo {
  value: string;
  image: string;
}

export const formatPriceInfo = (
  currencyAddress: string,
  rawValue: number,
  fallbackDecimals = 0,
): MarketplacePriceInfo => {
  const checksumCurrency = getChecksumAddress(currencyAddress);
  const metadata = erc20Metadata.find(
    (item) => getChecksumAddress(item.l2_token_address) === checksumCurrency,
  );

  const image = metadata?.logo_url || makeBlockie(currencyAddress);
  const decimals = metadata?.decimals ?? fallbackDecimals;
  const normalizedValue = rawValue / 10 ** decimals;

  return {
    value: normalizedValue.toString(),
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
      ? ordersByToken
          .filter((order): order is OrderModel => Boolean(order))
          .sort((a, b) => Number(a.price) - Number(b.price))
      : Object.values(ordersByToken)
          .filter((order): order is OrderModel => Boolean(order))
          .sort((a, b) => Number(a.price) - Number(b.price)),
  );

  if (listings.length === 0) return null;

  const cheapest = listings[0];
  if (!cheapest) return null;

  return formatPriceInfo(cheapest.currency, cheapest.price);
};

export const deriveLatestSalePrice = (
  sales: Record<string, Record<string, SaleEvent>> | undefined,
) => {
  if (!sales) return null;

  const orderedSales = Object.values(sales).flatMap((byToken) =>
    Object.values(byToken).sort((a, b) => b.time - a.time),
  );

  if (orderedSales.length === 0) return null;

  const latest = orderedSales[0];
  if (!latest?.order) return null;

  return formatPriceInfo(latest.order.currency, latest.order.price);
};

export const deriveLatestSalePriceForToken = (
  sales: Record<string, SaleEvent> | undefined,
) => {
  if (!sales) return null;

  const orderedSales = Object.values(sales).sort((a, b) => b.time - a.time);
  if (orderedSales.length === 0) return null;

  const latest = orderedSales[0];
  if (!latest?.order) return null;

  return formatPriceInfo(latest.order.currency, latest.order.price);
};
