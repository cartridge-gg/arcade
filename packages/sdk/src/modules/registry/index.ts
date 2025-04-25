import { initSDK } from "..";
import { constants } from "starknet";
import { Game, GameModel } from "./game";
import { Edition, EditionModel } from "./edition";
import { ClauseBuilder, ParsedEntity, SDK, StandardizedQueryResult, ToriiQueryBuilder } from "@dojoengine/sdk";
import { SchemaType } from "../../bindings";
import { NAMESPACE } from "../../constants";
import { RegistryOptions, DefaultRegistryOptions } from "./options";

export * from "./policies";
export { GameModel, EditionModel, RegistryOptions };
export type RegistryModel = GameModel | EditionModel;

export const Registry = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubEntities: undefined as (() => void) | undefined,

  init: async (chainId: constants.StarknetChainId) => {
    Registry.sdk = await initSDK(chainId);
  },

  isEntityQueryable(options: RegistryOptions) {
    return options.game || options.edition;
  },

  getEntityQuery: (options: RegistryOptions = DefaultRegistryOptions) => {
    const keys: `${string}-${string}`[] = [];
    if (options.game) keys.push(`${NAMESPACE}-${Game.getModelName()}`);
    if (options.edition) keys.push(`${NAMESPACE}-${Edition.getModelName()}`);
    const clauses = new ClauseBuilder().keys(keys, []);
    return new ToriiQueryBuilder<SchemaType>().withClause(clauses.build()).includeHashedKeys();
  },

  fetchEntities: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions) => {
    if (!Registry.sdk) return;

    const wrappedCallback = (
      entities?: StandardizedQueryResult<SchemaType> | StandardizedQueryResult<SchemaType>[],
    ) => {
      if (!entities) return;
      const models: RegistryModel[] = [];
      (entities as ParsedEntity<SchemaType>[]).forEach((entity: ParsedEntity<SchemaType>) => {
        if (entity.models[NAMESPACE][Edition.getModelName()]) {
          models.push(Edition.parse(entity));
        }
        if (entity.models[NAMESPACE][Game.getModelName()]) {
          models.push(Game.parse(entity));
        }
      });
      callback(models);
    };
    const query = Registry.getEntityQuery(options);
    try {
      const entities = await Registry.sdk.getEntities({ query });
      wrappedCallback(entities);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  },

  subEntities: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions) => {
    if (!Registry.sdk) return;
    const wrappedCallback = ({
      data,
      error,
    }: {
      data?: StandardizedQueryResult<SchemaType> | StandardizedQueryResult<SchemaType>[] | undefined;
      error?: Error | undefined;
    }) => {
      if (error) {
        console.error("Error subscribing to entities:", error);
        return;
      }
      if (!data || data.length === 0 || BigInt((data[0] as ParsedEntity<SchemaType>).entityId) === 0n) return;
      const entity = (data as ParsedEntity<SchemaType>[])[0];
      const eraseable = !entity.models[NAMESPACE];
      if (!!entity.models[NAMESPACE]?.[Edition.getModelName()] || eraseable) {
        const edition = Edition.parse(entity);
        callback([edition]);
      }
      if (!!entity.models[NAMESPACE]?.[Game.getModelName()] || eraseable) {
        const game = Game.parse(entity);
        callback([game]);
      }
    };

    const query = Registry.getEntityQuery(options);
    const [_, subscription] = await Registry.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Registry.unsubEntities = () => subscription.cancel();
  },

  fetch: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions = DefaultRegistryOptions) => {
    if (!Registry.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Registry.isEntityQueryable(options)) {
      await Registry.fetchEntities(callback, options);
    }
  },

  sub: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions = DefaultRegistryOptions) => {
    if (!Registry.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Registry.isEntityQueryable(options)) {
      await Registry.subEntities(callback, options);
    }
  },

  unsub: () => {
    if (Registry.unsubEntities) {
      Registry.unsubEntities();
      Registry.unsubEntities = undefined;
    }
  },
};
