import { initArcadeSDK } from "..";
import type { constants } from "starknet";
import { Pin, PinEvent } from "./pin";
import { Follow, FollowEvent } from "./follow";
import { Guild, GuildModel } from "./guild";
import { Alliance, AllianceModel } from "./alliance";
import { Member, MemberModel } from "./member";
import {
  ClauseBuilder,
  type ParsedEntity,
  type SDK,
  type StandardizedQueryResult,
  ToriiQueryBuilder,
  type ToriiResponse,
} from "@dojoengine/sdk";
import { NAMESPACE } from "../../constants";
import { SocialOptions, DefaultSocialOptions } from "./options";
import type { SchemaType } from "../../bindings";

export * from "./policies";
export {
  PinEvent,
  FollowEvent,
  GuildModel,
  AllianceModel,
  MemberModel,
  SocialOptions,
};
export type SocialModel =
  | AllianceModel
  | GuildModel
  | MemberModel
  | PinEvent
  | FollowEvent;

export const Social = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubEntities: undefined as (() => void) | undefined,
  unsubEvents: undefined as (() => void) | undefined,

  init: async (chainId: constants.StarknetChainId) => {
    Social.sdk = await initArcadeSDK(chainId);
  },

  isEntityQueryable(options: SocialOptions) {
    return options.alliance || options.guild || options.member;
  },

  isEventQueryable(options: SocialOptions) {
    return options.pin || options.follow;
  },

  getEntityQuery: (options: SocialOptions = DefaultSocialOptions) => {
    const keys: `${string}-${string}`[] = [];
    if (options.alliance) keys.push(`${NAMESPACE}-${Alliance.getModelName()}`);
    if (options.guild) keys.push(`${NAMESPACE}-${Guild.getModelName()}`);
    if (options.member) keys.push(`${NAMESPACE}-${Member.getModelName()}`);
    const clauses = new ClauseBuilder().keys(keys, []);
    return new ToriiQueryBuilder<SchemaType>()
      .withClause(clauses.build())
      .includeHashedKeys();
  },

  getEventQuery: (options: SocialOptions = DefaultSocialOptions) => {
    const keys: `${string}-${string}`[] = [];
    if (options.pin) keys.push(`${NAMESPACE}-${Pin.getModelName()}`);
    if (options.follow) keys.push(`${NAMESPACE}-${Follow.getModelName()}`);
    const clauses = new ClauseBuilder().keys(keys, []);
    return new ToriiQueryBuilder<SchemaType>()
      .withClause(clauses.build())
      .includeHashedKeys();
  },

  fetchEntities: async (
    callback: (models: SocialModel[]) => void,
    options: SocialOptions,
  ) => {
    if (!Social.sdk) return;

    const wrappedCallback = (entities: ToriiResponse<SchemaType>) => {
      if (!entities) return;
      const models: SocialModel[] = [];
      const items = entities?.getItems();
      for (const entity of items) {
        if (entity.models[NAMESPACE][Alliance.getModelName()]) {
          models.push(Alliance.parse(entity as any));
        }
        if (entity.models[NAMESPACE][Guild.getModelName()]) {
          models.push(Guild.parse(entity as any));
        }
        if (entity.models[NAMESPACE][Member.getModelName()]) {
          models.push(Member.parse(entity as any));
        }
      }
      callback(models);
    };
    const query = Social.getEntityQuery(options);
    try {
      const entities = await Social.sdk.getEntities({ query });
      wrappedCallback(entities);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  },

  fetchEvents: async (
    callback: (models: SocialModel[]) => void,
    options: SocialOptions,
  ) => {
    if (!Social.sdk) return;
    const wrappedCallback = (entities: ToriiResponse<SchemaType>) => {
      if (!entities) return;
      const events: SocialModel[] = [];
      const items = entities?.getItems();
      for (const entity of items) {
        if (entity.models[NAMESPACE][Pin.getModelName()]) {
          events.push(Pin.parse(entity as any));
        }
        if (entity.models[NAMESPACE][Follow.getModelName()]) {
          events.push(Follow.parse(entity as any));
        }
      }
      callback(events);
    };
    const query = Social.getEventQuery(options);
    try {
      const events = await Social.sdk.getEventMessages({
        query,
        historical: false,
      });
      wrappedCallback(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  },

  subEntities: async (
    callback: (models: SocialModel[]) => void,
    options: SocialOptions,
  ) => {
    if (!Social.sdk) return;

    const wrappedCallback = ({
      data,
      error,
    }: {
      data?: StandardizedQueryResult<SchemaType> | undefined;
      error?: Error | undefined;
    }) => {
      if (error) {
        console.error("Error subscribing to entities:", error);
        return;
      }
      if (
        !data ||
        data.length === 0 ||
        (data[0] as ParsedEntity<SchemaType>).entityId === "0x0"
      )
        return;
      const entity = (data as ParsedEntity<SchemaType>[])[0];
      const eraseable = !entity.models[NAMESPACE];
      if (entity.models[NAMESPACE]?.[Alliance.getModelName()] || eraseable) {
        callback([Alliance.parse(entity as any)]);
      }
      if (entity.models[NAMESPACE]?.[Guild.getModelName()] || eraseable) {
        callback([Guild.parse(entity as any)]);
      }
      if (entity.models[NAMESPACE]?.[Member.getModelName()] || eraseable) {
        callback([Member.parse(entity as any)]);
      }
    };

    const query = Social.getEntityQuery(options);

    const [_, subscription] = await Social.sdk.subscribeEntityQuery({
      query,
      callback: wrappedCallback,
    });
    Social.unsubEntities = () => subscription.cancel();
  },

  subEvents: async (
    callback: (models: SocialModel[]) => void,
    options: SocialOptions,
  ) => {
    if (!Social.sdk) return;

    const wrappedCallback = ({
      data,
      error,
    }: {
      data?:
        | StandardizedQueryResult<SchemaType>
        | StandardizedQueryResult<SchemaType>[]
        | undefined;
      error?: Error | undefined;
    }) => {
      if (error) {
        console.error("Error subscribing to events:", error);
        return;
      }
      if (
        !data ||
        data.length === 0 ||
        (data[0] as ParsedEntity<SchemaType>).entityId === "0x0"
      )
        return;
      const entity = (data as ParsedEntity<SchemaType>[])[0];
      const eraseable = !entity.models[NAMESPACE];
      if (entity.models[NAMESPACE]?.[Pin.getModelName()] || eraseable) {
        callback([Pin.parse(entity as any)]);
      }
      if (entity.models[NAMESPACE]?.[Follow.getModelName()] || eraseable) {
        callback([Follow.parse(entity as any)]);
      }
    };

    const query = Social.getEventQuery(options);

    const [_, subscription] = await Social.sdk.subscribeEventQuery({
      query,
      callback: wrappedCallback,
    });
    Social.unsubEvents = () => subscription.cancel();
  },

  fetch: async (
    callback: (models: SocialModel[]) => void,
    options: SocialOptions = DefaultSocialOptions,
  ) => {
    if (!Social.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Social.isEntityQueryable(options)) {
      await Social.fetchEntities(callback, options);
    }
    if (Social.isEventQueryable(options)) {
      await Social.fetchEvents(callback, options);
    }
  },

  sub: async (
    callback: (models: SocialModel[]) => void,
    options: SocialOptions = DefaultSocialOptions,
  ) => {
    if (!Social.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Social.isEntityQueryable(options)) {
      await Social.subEntities(callback, options);
    }
    if (Social.isEventQueryable(options)) {
      await Social.subEvents(callback, options);
    }
  },

  unsub: () => {
    if (Social.unsubEntities) {
      Social.unsubEntities();
      Social.unsubEntities = undefined;
    }
    if (Social.unsubEvents) {
      Social.unsubEvents();
      Social.unsubEvents = undefined;
    }
  },
};
