import { NAMESPACE } from "../../constants";
import { addAddressPadding } from "starknet";
import { SchemaType } from "../../bindings";
import { ParsedEntity, QueryBuilder, SDK, StandardizedQueryResult } from "@dojoengine/sdk";

const MODEL_NAME = "TrophyPinning";

export class PinningEvent {
  constructor(
    public playerId: string,
    public achievementId: string,
    public time: number,
  ) {
    this.playerId = playerId;
    this.achievementId = achievementId;
    this.time = time;
  }

  static from(model: any) {
    const playerId = addAddressPadding(model.player_id);
    const achievementId = `0x${BigInt(String(model.achievement_id)).toString(16)}`;
    const time = Number(model.time);
    return new PinningEvent(playerId, achievementId, time);
  }
}

export const Pinning = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubscribe: undefined as (() => void) | undefined,

  init: (sdk: SDK<SchemaType>) => {
    Pinning.sdk = sdk;
  },

  fetch: async (callback: (models: PinningEvent[]) => void) => {
    if (!Pinning.sdk) return;

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
        PinningEvent.from(entity.models[NAMESPACE][MODEL_NAME]),
      );
      callback(models);
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("player_id", "0x0")))
      .build();

    await Pinning.sdk.getEventMessages({ query, callback: wrappedCallback });
  },

  sub: async (callback: (event: PinningEvent) => void) => {
    if (!Pinning.sdk) return;

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
      callback(PinningEvent.from(entity.models[NAMESPACE][MODEL_NAME]));
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("player_id", "0x0")))
      .build();

    const subscription = await Pinning.sdk.subscribeEventQuery({ query, callback: wrappedCallback });
    Pinning.unsubscribe = () => subscription.cancel();
  },

  unsub: () => {
    if (!Pinning.unsubscribe) return;
    Pinning.unsubscribe();
    Pinning.unsubscribe = undefined;
  },
};
