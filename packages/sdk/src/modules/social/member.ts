import { NAMESPACE } from "../../constants";
import { SchemaType } from "../../bindings";
import { ParsedEntity, QueryBuilder, SDK, StandardizedQueryResult } from "@dojoengine/sdk";
import { addAddressPadding } from "starknet";

const MODEL_NAME = "Member";

export class MemberModel {
  constructor(
    public id: string,
    public role: number,
    public guildId: number,
    public pendingGuildId: number,
  ) {
    this.id = id;
    this.role = role;
    this.guildId = guildId;
    this.pendingGuildId = pendingGuildId;
  }

  static from(model: any) {
    const id = addAddressPadding(model.id);
    const role = Number(model.role);
    const guildId = Number(model.guild_id);
    const pendingGuildId = Number(model.pending_guild_id);
    return new MemberModel(id, role, guildId, pendingGuildId);
  }
}

export const Member = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubscribe: undefined as (() => void) | undefined,

  init: (sdk: SDK<SchemaType>) => {
    Member.sdk = sdk;
  },

  fetch: async (callback: (models: MemberModel[]) => void) => {
    if (!Member.sdk) return;

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
        MemberModel.from(entity.models[NAMESPACE][MODEL_NAME]),
      );
      callback(models);
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("id", "0x0")))
      .build();

    await Member.sdk.getEntities({ query, callback: wrappedCallback });
  },

  sub: async (callback: (event: MemberModel) => void) => {
    if (!Member.sdk) return;

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
      callback(MemberModel.from(entity.models[NAMESPACE][MODEL_NAME]));
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("id", "0x0")))
      .build();

    const subscription = await Member.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Member.unsubscribe = () => subscription.cancel();
  },

  unsub: () => {
    if (!Member.unsubscribe) return;
    Member.unsubscribe();
    Member.unsubscribe = undefined;
  },

  getMethods: () => [],
};
