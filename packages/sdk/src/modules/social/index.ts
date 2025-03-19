import { initSDK } from "..";
import { constants } from "starknet";
import { Pin, PinEvent } from "./pin";
import { Follow, FollowEvent } from "./follow";
import { Guild, GuildModel } from "./guild";
import { Alliance, AllianceModel } from "./alliance";
import { Member, MemberModel } from "./member";
import { OrComposeClause, ParsedEntity, SDK, StandardizedQueryResult, ToriiQueryBuilder } from "@dojoengine/sdk";
import { SchemaType } from "../../bindings";
import { NAMESPACE } from "../../constants";
import { SocialOptions, DefaultSocialOptions } from "./options";

export * from "./policies";
export { PinEvent, FollowEvent, GuildModel, AllianceModel, MemberModel, SocialOptions };
export type SocialModel = AllianceModel | GuildModel | MemberModel | PinEvent | FollowEvent;

export const Social = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubEntities: undefined as (() => void) | undefined,
  unsubEvents: undefined as (() => void) | undefined,

  init: async (chainId: constants.StarknetChainId) => {
    Social.sdk = await initSDK(chainId);
  },

  isEntityQueryable(options: SocialOptions) {
    return options.alliance || options.guild || options.member;
  },

  isEventQueryable(options: SocialOptions) {
    return options.pin || options.follow;
  },

  getEntityQuery: (options: SocialOptions = DefaultSocialOptions) => {
    const clauses = [];
    if (options.alliance) clauses.push(Alliance.getClause());
    if (options.guild) clauses.push(Guild.getClause());
    if (options.member) clauses.push(Member.getClause());
    return new ToriiQueryBuilder<SchemaType>().withClause(OrComposeClause(clauses).build()).includeHashedKeys();
  },

  getEventQuery: (options: SocialOptions = DefaultSocialOptions) => {
    const clauses = [];
    if (options.pin) clauses.push(Pin.getClause());
    if (options.follow) clauses.push(Follow.getClause());
    return new ToriiQueryBuilder<SchemaType>().withClause(OrComposeClause(clauses).build()).includeHashedKeys();
  },

  fetchEntities: async (callback: (models: SocialModel[]) => void, options: SocialOptions) => {
    if (!Social.sdk) return;

    const wrappedCallback = (entities: StandardizedQueryResult<SchemaType> | StandardizedQueryResult<SchemaType>[]) => {
      if (!entities) return;
      const models: SocialModel[] = [];
      (entities as ParsedEntity<SchemaType>[]).forEach((entity: ParsedEntity<SchemaType>) => {
        if (entity.models[NAMESPACE][Alliance.getModelName()]) {
          models.push(Alliance.parse(entity));
        }
        if (entity.models[NAMESPACE][Guild.getModelName()]) {
          models.push(Guild.parse(entity));
        }
        if (entity.models[NAMESPACE][Member.getModelName()]) {
          models.push(Member.parse(entity));
        }
      });
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

  fetchEvents: async (callback: (models: SocialModel[]) => void, options: SocialOptions) => {
    if (!Social.sdk) return;
    const wrappedCallback = (entities: StandardizedQueryResult<SchemaType> | StandardizedQueryResult<SchemaType>[]) => {
      if (!entities) return;
      const events: SocialModel[] = [];
      (entities as ParsedEntity<SchemaType>[]).forEach((entity: ParsedEntity<SchemaType>) => {
        if (entity.models[NAMESPACE][Pin.getModelName()]) {
          events.push(Pin.parse(entity));
        }
        if (entity.models[NAMESPACE][Follow.getModelName()]) {
          events.push(Follow.parse(entity));
        }
      });
      callback(events);
    };
    const query = Social.getEventQuery(options);
    try {
      const events = await Social.sdk.getEventMessages({ query, historical: false });
      wrappedCallback(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  },

  subEntities: async (callback: (models: SocialModel[]) => void, options: SocialOptions) => {
    if (!Social.sdk) return;

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
      if (!data || data.length === 0 || (data[0] as ParsedEntity<SchemaType>).entityId === "0x0") return;
      const entity = (data as ParsedEntity<SchemaType>[])[0];
      if (entity.models[NAMESPACE][Alliance.getModelName()]) {
        callback([Alliance.parse(entity)]);
      }
      if (entity.models[NAMESPACE][Guild.getModelName()]) {
        callback([Guild.parse(entity)]);
      }
      if (entity.models[NAMESPACE][Member.getModelName()]) {
        callback([Member.parse(entity)]);
      }
    };

    const query = Social.getEntityQuery(options);

    const [_, subscription] = await Social.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Social.unsubEntities = () => subscription.cancel();
  },

  subEvents: async (callback: (models: SocialModel[]) => void, options: SocialOptions) => {
    if (!Social.sdk) return;

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
      if (!data || data.length === 0 || (data[0] as ParsedEntity<SchemaType>).entityId === "0x0") return;
      const entity = (data as ParsedEntity<SchemaType>[])[0];
      if (entity.models[NAMESPACE][Pin.getModelName()]) {
        callback([Pin.parse(entity)]);
      }
      if (entity.models[NAMESPACE][Follow.getModelName()]) {
        callback([Follow.parse(entity)]);
      }
    };

    const query = Social.getEventQuery(options);

    const [_, subscription] = await Social.sdk.subscribeEventQuery({ query, callback: wrappedCallback });
    Social.unsubEvents = () => subscription.cancel();
  },

  fetch: async (callback: (models: SocialModel[]) => void, options: SocialOptions = DefaultSocialOptions) => {
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

  sub: async (callback: (models: SocialModel[]) => void, options: SocialOptions = DefaultSocialOptions) => {
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
