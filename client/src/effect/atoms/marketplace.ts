import { Atom } from "@effect-atom/atom-react";
import { Array as A, pipe } from "effect";
import type {
  BookModel,
  OrderModel,
  ListingEvent,
  SaleEvent,
} from "@cartridge/arcade";
import { CategoryType, StatusType } from "@cartridge/arcade";
import { getChecksumAddress } from "starknet";
import { arcadeAtom } from "./arcade";
import type { ArcadeEntityItem, ArcadeEventItem } from "../layers/arcade";

export type OrdersState = {
  [collection: string]: { [token: string]: { [order: string]: OrderModel } };
};

export type ListingsState = {
  [collection: string]: {
    [token: string]: { [listing: string]: OrderModel };
  };
};

export type SalesState = {
  [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
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
    const collection = getChecksumAddress(order.collection);
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
    const collection = getChecksumAddress(order.collection);
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
    const collection = getChecksumAddress(order.collection);
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
    A.filter((entity) => getArcadeMarketModels(entity)?.Sale !== undefined),
    A.map((entity) => getArcadeMarketModels(entity)!.Sale!.data),
  );

  return sales.reduce<SalesState>((acc, sale) => {
    const order = sale.order;
    const collection = getChecksumAddress(order.collection);
    const token = order.tokenId.toString();
    if (!acc[collection]) acc[collection] = {};
    if (!acc[collection][token]) acc[collection][token] = {};
    acc[collection][token][order.id] = sale;
    return acc;
  }, {});
});
