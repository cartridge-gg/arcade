import { NAMESPACE } from "../../constants";
import { addAddressPadding } from "starknet";
import { SchemaType } from "../../bindings";
import { ParsedEntity, QueryBuilder, SDK, StandardizedQueryResult } from "@dojoengine/sdk";

const MODEL_NAME = "Follow";

export class FollowEvent {
  constructor(
    public follower: string,
    public followed: string,
    public time: number,
  ) {
    this.follower = follower;
    this.followed = followed;
    this.time = time;
  }

  static from(model: any) {
    const follower = addAddressPadding(model.follower);
    const followed = addAddressPadding(model.followed);
    const time = Number(model.time);
    return new FollowEvent(follower, followed, time);
  }
}

export const Follow = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubscribe: undefined as (() => void) | undefined,

  init: (sdk: SDK<SchemaType>) => {
    Follow.sdk = sdk;
  },

  fetch: async (callback: (models: FollowEvent[]) => void) => {
    if (!Follow.sdk) return;

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
        FollowEvent.from(entity.models[NAMESPACE][MODEL_NAME]),
      );
      callback(models);
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("follower", "0x0")))
      .build();

    await Follow.sdk.getEventMessages({ query, callback: wrappedCallback });
  },

  sub: async (callback: (event: FollowEvent) => void) => {
    if (!Follow.sdk) return;

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
      callback(FollowEvent.from(entity.models[NAMESPACE][MODEL_NAME]));
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("follower", "0x0")))
      .build();

    const subscription = await Follow.sdk.subscribeEventQuery({ query, callback: wrappedCallback });
    Follow.unsubscribe = () => subscription.cancel();
  },

  unsub: () => {
    if (!Follow.unsubscribe) return;
    Follow.unsubscribe();
    Follow.unsubscribe = undefined;
  },

  getMethods: () => [
    { name: "follow", entrypoint: "follow", description: "Follow another player." },
    { name: "unfollow", entrypoint: "unfollow", description: "Unfollow a player." },
  ],
};
