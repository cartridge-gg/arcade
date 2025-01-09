import * as torii from "@dojoengine/torii-client";

const MODEL_NAME = "ARCADE-TrophyPinning";
const DEFAULT_KEYS_CLAUSES: torii.EntityKeysClause[] = [
  { Keys: { keys: [undefined, undefined], pattern_matching: "FixedLen", models: [MODEL_NAME] } },
];
const DEFAULT_CLAUSE: torii.Clause = {
  Keys: { keys: [undefined, undefined], pattern_matching: "FixedLen", models: [MODEL_NAME] },
};

export type PinningEvent = {
  playerId: string;
  achievementId: string;
  time: number;
};

export const Pinning = {
  client: undefined as torii.ToriiClient | undefined,
  unsubscribe: undefined as torii.Subscription | undefined,

  init: (toriiClient: torii.ToriiClient) => {
    Pinning.client = toriiClient;
  },

  fetch: async (
    callback: (events: PinningEvent[]) => void,
    clause: torii.Clause = DEFAULT_CLAUSE,
    limit: number = 1000,
    offset: number = 0,
    order_by: torii.OrderBy[] = [],
    entity_models: string[] = [],
    dont_include_hashed_keys: boolean = false,
    entity_updated_after: number = 0,
    historical: boolean = false,
  ) => {
    if (!Pinning.client) return;
    const events: PinningEvent[] = [];
    while (true) {
      const entities: torii.Entities = await Pinning.client.getEventMessages(
        {
          limit,
          offset,
          clause,
          order_by,
          entity_models,
          dont_include_hashed_keys,
          entity_updated_after,
        },
        historical,
      );
      Object.values(entities).forEach((event: torii.Entity) => {
        if (!event[MODEL_NAME]) return;
        const model = event[MODEL_NAME];
        const playerId = BigInt(String(model.player_id.value)).toString(16);
        const achievementId = BigInt(String(model.achievement_id.value)).toString(16);
        const time = Number(model.time.value);
        events.push({
          playerId,
          achievementId,
          time,
        });
      });
      if (events.length < limit) break;
      offset += limit;
    }
    callback(events);
  },

  sub: async (
    callback: (event: PinningEvent) => void,
    clauses: torii.EntityKeysClause[] = DEFAULT_KEYS_CLAUSES,
    historical: boolean = false,
  ) => {
    if (!Pinning.client) return;
    const wrappedCallback = (_fetchedEntities: any, event: any) => {
      if (!event[MODEL_NAME]) return;
      const model = event[MODEL_NAME];
      const playerId = BigInt(String(model.player_id.value)).toString(16);
      const achievementId = BigInt(String(model.achievement_id.value)).toString(16);
      const time = Number(model.time.value);
      const pinningEvent: PinningEvent = { playerId, achievementId, time };
      callback(pinningEvent);
    };
    const subscription = async () => {
      if (!Pinning.client) return;
      return Pinning.client.onEventMessageUpdated(clauses, historical, wrappedCallback);
    };
    subscription()
      .then((sync) => (Pinning.unsubscribe = sync))
      .catch((error) => console.error("Error setting up entity sync:", error));
  },

  unsub: () => {
    if (!Pinning.unsubscribe) return;
    Pinning.unsubscribe.cancel();
    Pinning.unsubscribe = undefined;
  },
};
