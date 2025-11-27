import { Atom } from "@effect-atom/atom-react";
import type { BookModel, OrderModel, ListingEvent, SaleEvent } from "@cartridge/arcade";

export type OrdersState = {
  [collection: string]: { [token: string]: { [order: string]: OrderModel } };
};

export type ListingsState = {
  [collection: string]: { [token: string]: { [listing: string]: ListingEvent } };
};

export type SalesState = {
  [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
};

export const bookAtom = Atom.make<BookModel | null>(null);

export const ordersAtom = Atom.make<OrdersState>({});

export const listingsAtom = Atom.make<ListingsState>({});

export const salesAtom = Atom.make<SalesState>({});
