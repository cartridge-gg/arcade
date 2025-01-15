import { NAMESPACE } from "../../constants";
import { SchemaType } from "../../bindings";
import { ParsedEntity, QueryBuilder, SDK, StandardizedQueryResult } from "@dojoengine/sdk";
import { Metadata, Socials } from "../../classes";

const MODEL_NAME = "Alliance";

export class AllianceModel {
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
    return new AllianceModel(id, open, free, guildCount, metadata, socials);
  }
}

export const Alliance = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubscribe: undefined as (() => void) | undefined,

  init: (sdk: SDK<SchemaType>) => {
    Alliance.sdk = sdk;
  },

  fetch: async (callback: (models: AllianceModel[]) => void) => {
    if (!Alliance.sdk) return;

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
        AllianceModel.from(entity.models[NAMESPACE][MODEL_NAME]),
      );
      callback(models);
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("id", "0x0")))
      .build();

    await Alliance.sdk.getEntities({ query, callback: wrappedCallback });
  },

  sub: async (callback: (event: AllianceModel) => void) => {
    if (!Alliance.sdk) return;

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
      callback(AllianceModel.from(entity.models[NAMESPACE][MODEL_NAME]));
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("id", "0x0")))
      .build();

    const subscription = await Alliance.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Alliance.unsubscribe = () => subscription.cancel();
  },

  unsub: () => {
    if (!Alliance.unsubscribe) return;
    Alliance.unsubscribe();
    Alliance.unsubscribe = undefined;
  },

  getMethods: () => [
    { name: "create_alliance", entrypoint: "create_alliance", description: "Create an alliance." },
    { name: "open_alliance", entrypoint: "open_alliance", description: "Open an alliance." },
    { name: "close_alliance", entrypoint: "close_alliance", description: "Close an alliance." },
    { name: "crown_guild", entrypoint: "crown_guild", description: "Crown a guild to lead the alliance." },
    { name: "hire_guild", entrypoint: "hire_guild", description: "Hire a guild in the alliance." },
    { name: "fire_guild", entrypoint: "fire_guild", description: "Fire a guild from the alliance." },
    { name: "request_alliance", entrypoint: "request_alliance", description: "Request to join an alliance." },
    { name: "cancel_alliance", entrypoint: "cancel_alliance", description: "Cancel a request to join an alliance." },
    { name: "leave_alliance", entrypoint: "leave_alliance", description: "Leave an alliance." },
  ],
};
