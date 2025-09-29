import { initArcadeSDK } from "..";
import { getChecksumAddress, type constants } from "starknet";
import { Moderator, ModeratorModel, type ModeratorInterface } from "./moderator";
import { Book, BookModel, type BookInterface } from "./book";
import { Order, OrderModel, type OrderInterface } from "./order";
import { Listing, ListingEvent, type ListingInterface } from "./listing";
import { Offer, OfferEvent, type OfferInterface } from "./offer";
import { Sale, SaleEvent, type SaleInterface } from "./sale";
import {
  ClauseBuilder,
  type ParsedEntity,
  type SDK,
  type StandardizedQueryResult,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
  type ToriiResponse,
} from "@dojoengine/sdk";
import type { SchemaType } from "../../bindings";
import { NAMESPACE } from "../../constants";
import { MarketplaceOptions, DefaultMarketplaceOptions } from "./options";
import type { Token, ToriiClient } from "@dojoengine/torii-wasm";

export type { Token, ToriiClient };
export * from "./policies";
export {
  ModeratorModel,
  BookModel,
  Order as SDKOrder,
  OrderModel,
  ListingEvent,
  OfferEvent,
  SaleEvent,
  MarketplaceOptions,
};
export type MarketplaceModel = ModeratorModel | BookModel | OrderModel | ListingEvent | OfferEvent | SaleEvent;

export type { ModeratorInterface, BookInterface, OrderInterface, ListingInterface, OfferInterface, SaleInterface };

export type WithCount<T> = T & { count: number };
export type Collection = Record<string, WithCount<Token>>;
export type Collections = Record<string, Collection>;

export const Marketplace = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubEntities: undefined as (() => void) | undefined,

  init: async (chainId: constants.StarknetChainId) => {
    Marketplace.sdk = await initArcadeSDK(chainId);
  },

  isEntityQueryable(options: MarketplaceOptions) {
    return options.access || options.book || options.order;
  },

  isEventQueryable(options: MarketplaceOptions) {
    return options.listing || options.offer || options.sale;
  },

  getEntityQuery: (options: MarketplaceOptions = DefaultMarketplaceOptions) => {
    const keys: `${string}-${string}`[] = [];
    if (options.access) keys.push(`${NAMESPACE}-${Moderator.getModelName()}`);
    if (options.book) keys.push(`${NAMESPACE}-${Book.getModelName()}`);
    if (options.order) keys.push(`${NAMESPACE}-${Order.getModelName()}`);
    const clauses = new ClauseBuilder().keys(keys, []);
    return new ToriiQueryBuilder<SchemaType>().withClause(clauses.build()).withEntityModels(keys).includeHashedKeys();
  },

  getEventQuery: (options: MarketplaceOptions = DefaultMarketplaceOptions) => {
    const keys: `${string}-${string}`[] = [];
    if (options.listing) keys.push(`${NAMESPACE}-${Listing.getModelName()}`);
    if (options.offer) keys.push(`${NAMESPACE}-${Offer.getModelName()}`);
    if (options.sale) keys.push(`${NAMESPACE}-${Sale.getModelName()}`);
    const clauses = new ClauseBuilder().keys(keys, []);
    return new ToriiQueryBuilder<SchemaType>().withClause(clauses.build()).withEntityModels(keys).includeHashedKeys();
  },

  fetchEntities: async (callback: (models: MarketplaceModel[]) => void, options: MarketplaceOptions) => {
    if (!Marketplace.sdk) return;

    const wrappedCallback = async (entities?: ToriiResponse<SchemaType>) => {
      if (!entities) return;
      const models: MarketplaceModel[] = [];
      const items = entities?.getItems();
      await Promise.all(
        items.map(async (entity: ParsedEntity<SchemaType>) => {
          if (entity.models[NAMESPACE][Moderator.getModelName()]) {
            models.push(Moderator.parse(entity));
          }
          if (entity.models[NAMESPACE][Book.getModelName()]) {
            models.push(Book.parse(entity));
          }
          if (entity.models[NAMESPACE][Order.getModelName()]) {
            models.push(Order.parse(entity));
          }
          return entity;
        }),
      );
      callback(models);
    };
    const query = Marketplace.getEntityQuery(options);
    try {
      const entities = await Marketplace.sdk.getEntities({ query });
      await wrappedCallback(entities);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  },

  fetchEvents: async (callback: (models: MarketplaceModel[]) => void, options: MarketplaceOptions) => {
    if (!Marketplace.sdk) return;

    const wrappedCallback = async (entities?: ToriiResponse<SchemaType>) => {
      if (!entities) return;
      const events: MarketplaceModel[] = [];
      const items = entities?.getItems();
      await Promise.all(
        items.map(async (entity: ParsedEntity<SchemaType>) => {
          if (entity.models[NAMESPACE][Listing.getModelName()]) {
            events.push(Listing.parse(entity));
          }
          if (entity.models[NAMESPACE][Offer.getModelName()]) {
            events.push(Offer.parse(entity));
          }
          if (entity.models[NAMESPACE][Sale.getModelName()]) {
            events.push(Sale.parse(entity));
          }
          return entity;
        }),
      );
      callback(events);
    };
    const query = Marketplace.getEventQuery(options);
    try {
      const events = await Marketplace.sdk.getEventMessages({ query });
      await wrappedCallback(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  },

  subEntities: async (callback: (models: MarketplaceModel[]) => void, options: MarketplaceOptions) => {
    if (!Marketplace.sdk) return;
    const wrappedCallback = ({ data, error }: SubscriptionCallbackArgs<StandardizedQueryResult<SchemaType>, Error>) => {
      if (error) {
        console.error("Error subscribing to marketplace entities:", error);
        return;
      }
      if (!data || data.length === 0 || BigInt(data[0].entityId) === 0n) return;
      const entity = data[0];
      const eraseable = !entity.models[NAMESPACE];
      if (!!entity.models[NAMESPACE]?.[Moderator.getModelName()] || eraseable) {
        callback([Moderator.parse(entity)]);
      }
      if (!!entity.models[NAMESPACE]?.[Book.getModelName()] || eraseable) {
        callback([Book.parse(entity)]);
      }
      if (!!entity.models[NAMESPACE]?.[Order.getModelName()] || eraseable) {
        callback([Order.parse(entity)]);
      }
    };

    const query = Marketplace.getEntityQuery(options);
    const [_, subscription] = await Marketplace.sdk.subscribeEntityQuery({
      query,
      callback: wrappedCallback,
    });
    Marketplace.unsubEntities = () => subscription.cancel();
  },

  subEvents: async (callback: (models: MarketplaceModel[]) => void, options: MarketplaceOptions) => {
    if (!Marketplace.sdk) return;
    const wrappedCallback = ({ data, error }: SubscriptionCallbackArgs<StandardizedQueryResult<SchemaType>, Error>) => {
      if (error) {
        console.error("Error subscribing to marketplace events:", error);
        return;
      }
      if (!data || data.length === 0 || BigInt(data[0].entityId) === 0n) return;
      const entity = data[0];
      const eraseable = !entity.models[NAMESPACE];
      if (!!entity.models[NAMESPACE]?.[Listing.getModelName()] || eraseable) {
        callback([Listing.parse(entity)]);
      }
      if (!!entity.models[NAMESPACE]?.[Offer.getModelName()] || eraseable) {
        callback([Offer.parse(entity)]);
      }
      if (!!entity.models[NAMESPACE]?.[Sale.getModelName()] || eraseable) {
        callback([Sale.parse(entity)]);
      }
    };

    const query = Marketplace.getEventQuery(options);
    const [_, subscription] = await Marketplace.sdk.subscribeEventQuery({
      query,
      callback: wrappedCallback,
    });
    Marketplace.unsubEntities = () => subscription.cancel();
  },

  fetch: async (
    callback: (models: MarketplaceModel[]) => void,
    options: MarketplaceOptions = DefaultMarketplaceOptions,
  ) => {
    if (!Marketplace.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Marketplace.isEntityQueryable(options)) {
      await Marketplace.fetchEntities(callback, options);
    }
    if (Marketplace.isEventQueryable(options)) {
      await Marketplace.fetchEvents(callback, options);
    }
  },

  sub: async (
    callback: (models: MarketplaceModel[]) => void,
    options: MarketplaceOptions = DefaultMarketplaceOptions,
  ) => {
    if (!Marketplace.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Marketplace.isEntityQueryable(options)) {
      await Marketplace.subEntities(callback, options);
    }
    if (Marketplace.isEventQueryable(options)) {
      await Marketplace.subEvents(callback, options);
    }
  },

  unsub: () => {
    if (Marketplace.unsubEntities) {
      Marketplace.unsubEntities();
      Marketplace.unsubEntities = undefined;
    }
  },

  fetchCollections: async (clients: { [key: string]: ToriiClient }, limit = 1000) => {
    const collections: Collections = {};
    await Promise.all(
      Object.keys(clients).map(async (project) => {
        const client = clients[project];
        try {
          let tokens = await client.getTokens({
            contract_addresses: [],
            token_ids: [],
            pagination: {
              cursor: undefined,
              limit: limit,
              order_by: [],
              direction: "Forward",
            },
            attribute_filters: [],
          });
          const allTokens = [...tokens.items];
          while (tokens.next_cursor) {
            tokens = await client.getTokens({
              contract_addresses: [],
              token_ids: [],
              pagination: {
                limit: limit,
                cursor: tokens.next_cursor,
                order_by: [],
                direction: "Forward",
              },
              attribute_filters: [],
            });
            allTokens.push(...tokens.items);
          }

          const filtereds = allTokens.filter((token) => !!token.metadata);
          if (filtereds.length === 0) return;

          const collection: Collection = filtereds.reduce((acc: Collection, curr: Token) => {
            const checksumAddress = getChecksumAddress(curr.contract_address);

            if (Object.hasOwn(acc, checksumAddress)) {
              acc[checksumAddress].count += 1;
              return acc;
            }

            acc[checksumAddress] = {
              ...curr,
              contract_address: checksumAddress,
              count: 1,
            };

            return acc;
          }, {});

          collections[project] = collection;
          return;
        } catch (error) {
          console.error("Error fetching tokens:", error, project);
          return;
        }
      }),
    );
    return collections;
  },
};
