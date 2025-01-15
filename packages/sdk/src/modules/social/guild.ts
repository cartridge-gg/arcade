import { NAMESPACE } from "../../constants";
import { SchemaType } from "../../bindings";
import { ParsedEntity, QueryBuilder, SDK, StandardizedQueryResult } from "@dojoengine/sdk";
import { Metadata, Socials } from "../../classes";

const MODEL_NAME = "Guild";

export class GuildModel {
  constructor(
    public id: number,
    public open: boolean,
    public free: boolean,
    public guildCount: number,
    public metadata: Metadata,
    public socials: Socials,
  ) {
    this.id = id;
    this.open = open;
    this.free = free;
    this.guildCount = guildCount;
    this.metadata = metadata;
    this.socials = socials;
  }

  static from(model: any) {
    const id = Number(model.id);
    const open = !!model.open;
    const free = !!model.free;
    const guildCount = Number(model.guild_count);
    const metadata = Metadata.from(model.metadata);
    const socials = Socials.from(model.socials);
    return new GuildModel(id, open, free, guildCount, metadata, socials);
  }
}

export const Guild = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubscribe: undefined as (() => void) | undefined,

  init: (sdk: SDK<SchemaType>) => {
    Guild.sdk = sdk;
  },

  fetch: async (callback: (models: GuildModel[]) => void) => {
    if (!Guild.sdk) return;

    const wrappedCallback = ({
      data,
      error,
    }: {
      data?: StandardizedQueryResult<SchemaType> | StandardizedQueryResult<SchemaType>[] | undefined;
      error?: Error | undefined;
    }) => {
      if (error) {
        console.error("Error fetching entities:", error);
        return;
      }
      if (!data) return;
      const models = (data as ParsedEntity<SchemaType>[]).map((entity) =>
        GuildModel.from(entity.models[NAMESPACE][MODEL_NAME]),
      );
      callback(models);
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("id", "0x0")))
      .build();

    await Guild.sdk.getEntities({ query, callback: wrappedCallback });
  },

  sub: async (callback: (event: GuildModel) => void) => {
    if (!Guild.sdk) return;

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
      if (!data || (data[0] as ParsedEntity<SchemaType>).entityId === "0x0") return;
      const entity = (data as ParsedEntity<SchemaType>[])[0];
      callback(GuildModel.from(entity.models[NAMESPACE][MODEL_NAME]));
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("id", "0x0")))
      .build();

    const subscription = await Guild.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Guild.unsubscribe = () => subscription.cancel();
  },

  unsub: () => {
    if (!Guild.unsubscribe) return;
    Guild.unsubscribe();
    Guild.unsubscribe = undefined;
  },

  getMethods: () => [
    { name: "create_guild", entrypoint: "create_guild", description: "Create a guild." },
    { name: "open_guild", entrypoint: "open_guild", description: "Open a guild." },
    { name: "close_guild", entrypoint: "close_guild", description: "Close a guild." },
    { name: "crown_member", entrypoint: "crown_member", description: "Crown a member to lead the guild." },
    { name: "promote_member", entrypoint: "promote_member", description: "Promote a member to officer." },
    { name: "demote_member", entrypoint: "demote_member", description: "Demote an officer to member." },
    { name: "hire_member", entrypoint: "hire_member", description: "Hire a member to the guild." },
    { name: "fire_member", entrypoint: "fire_member", description: "Fire a member from the guild." },
  ],
};
