import { NAMESPACE } from "../../constants";
import { shortString, addAddressPadding } from "starknet";
import { SchemaType } from "../../bindings";
import { ParsedEntity, QueryBuilder, SDK, StandardizedQueryResult } from "@dojoengine/sdk";

const MODEL_NAME = "Achievement";

export class AchievementModel {
  constructor(
    public worldAddress: string,
    public namespace: string,
    public id: string,
    public published: boolean,
    public whitelisted: boolean,
    public karma: number,
  ) {
    this.worldAddress = worldAddress;
    this.namespace = namespace;
    this.id = id;
    this.published = published;
    this.whitelisted = whitelisted;
    this.karma = karma;
  }

  static from(model: any) {
    const worldAddress = addAddressPadding(model.world_address);
    const namespace = shortString.decodeShortString(`0x${BigInt(model.namespace).toString(16)}`);
    const id = shortString.decodeShortString(`0x${BigInt(model.id).toString(16)}`);
    const published = !!model.published;
    const whitelisted = !!model.whitelisted;
    const karma = Number(model.karma);
    return new AchievementModel(worldAddress, namespace, id, published, whitelisted, karma);
  }
}

export const Achievement = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubscribe: undefined as (() => void) | undefined,

  init: (sdk: SDK<SchemaType>) => {
    Achievement.sdk = sdk;
  },

  fetch: async (callback: (models: AchievementModel[]) => void) => {
    if (!Achievement.sdk) return;

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
        AchievementModel.from(entity.models[NAMESPACE][MODEL_NAME]),
      );
      callback(models);
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("world_address", "0x0")))
      .build();

    await Achievement.sdk.getEntities({ query, callback: wrappedCallback });
  },

  sub: async (callback: (event: AchievementModel) => void) => {
    if (!Achievement.sdk) return;

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
      callback(AchievementModel.from(entity.models[NAMESPACE][MODEL_NAME]));
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("world_address", "0x0")))
      .build();

    const subscription = await Achievement.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Achievement.unsubscribe = () => subscription.cancel();
  },

  unsub: () => {
    if (!Achievement.unsubscribe) return;
    Achievement.unsubscribe();
    Achievement.unsubscribe = undefined;
  },

  getMethods: () => [
    { name: "register_achievement", entrypoint: "register_achievement", description: "Register an achievement." },
    { name: "update_achievement", entrypoint: "update_achievement", description: "Update an achievement." },
    { name: "publish_achievement", entrypoint: "publish_achievement", description: "Publish an achievement." },
    { name: "hide_achievement", entrypoint: "hide_achievement", description: "Hide an achievement." },
    { name: "whitelist_achievement", entrypoint: "whitelist_achievement", description: "Whitelist an achievement." },
    { name: "blacklist_achievement", entrypoint: "blacklist_achievement", description: "Blacklist an achievement." },
    { name: "remove_achievement", entrypoint: "remove_achievement", description: "Remove an achievement." },
  ],
};
