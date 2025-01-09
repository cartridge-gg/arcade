import * as torii from "@dojoengine/torii-client";
import { NAMESPACE } from "../../constants";
import { shortString } from "starknet";

const MODEL_NAME = `${NAMESPACE}-Game`;
const DEFAULT_KEYS_CLAUSES: torii.EntityKeysClause[] = [
  { Keys: { keys: [undefined, undefined], pattern_matching: "FixedLen", models: [MODEL_NAME] } },
];
const DEFAULT_CLAUSE: torii.Clause = {
  Keys: { keys: [undefined, undefined], pattern_matching: "FixedLen", models: [MODEL_NAME] },
};

export class GameModel {
  constructor(
    public worldAddress: string,
    public namespace: string,
    public project: string,
    public active: boolean,
    public published: boolean,
    public whitelisted: boolean,
    public priority: number,
    public karma: number,
    public metadata: Metadata,
    public socials: Socials,
    public owner: string,
  ) {
    this.worldAddress = worldAddress;
    this.namespace = namespace;
    this.project = project;
    this.active = active;
    this.published = published;
    this.whitelisted = whitelisted;
    this.priority = priority;
    this.karma = karma;
    this.metadata = metadata;
    this.socials = socials;
    this.owner = owner;
  }

  static from(model: torii.Model) {
    const worldAddress = String(model.world_address.value);
    const namespace = shortString.decodeShortString(String(model.namespace.value));
    const project = shortString.decodeShortString(String(model.project.value));
    const active = !!model.active.value;
    const published = !!model.published.value;
    const whitelisted = !!model.whitelisted.value;
    const priority = Number(model.priority.value);
    const karma = Number(model.karma.value);
    const metadata = Metadata.from(String(model.metadata.value));
    const socials = Socials.from(String(model.socials.value));
    const owner = BigInt(String(model.owner.value)).toString(16);
    return new GameModel(
      worldAddress,
      namespace,
      project,
      active,
      published,
      whitelisted,
      priority,
      karma,
      metadata,
      socials,
      owner,
    );
  }
}

export class Metadata {
  constructor(
    public color: string,
    public name: string,
    public description: string,
    public image: string,
    public banner: string,
  ) {
    this.color = color;
    this.name = name;
    this.description = description;
    this.image = image;
    this.banner = banner;
  }

  static from(value: string) {
    const json = JSON.parse(value);
    return new Metadata(json.color, json.name, json.description, json.image, json.banner);
  }
}

export class Socials {
  constructor(
    public discord: string,
    public telegram: string,
    public twitter: string,
    public youtube: string,
    public website: string,
  ) {
    this.discord = discord;
    this.telegram = telegram;
    this.twitter = twitter;
    this.youtube = youtube;
    this.website = website;
  }

  static from(value: string) {
    const json = JSON.parse(value);
    return new Socials(json.discord, json.telegram, json.twitter, json.youtube, json.website);
  }
}

export const Game = {
  client: undefined as torii.ToriiClient | undefined,
  unsubscribe: undefined as torii.Subscription | undefined,

  init: (toriiClient: torii.ToriiClient) => {
    Game.client = toriiClient;
  },

  fetch: async (
    callback: (models: GameModel[]) => void,
    clause: torii.Clause = DEFAULT_CLAUSE,
    limit: number = 1000,
    offset: number = 0,
    order_by: torii.OrderBy[] = [],
    entity_models: string[] = [],
    dont_include_hashed_keys: boolean = false,
    entity_updated_after: number = 0,
    historical: boolean = false,
  ) => {
    if (!Game.client) return;
    const models: GameModel[] = [];
    while (true) {
      const entities: torii.Entities = await Game.client.getEventMessages(
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
        const gameModel = GameModel.from(model);
        models.push(gameModel);
      });
      if (models.length < limit) break;
      offset += limit;
    }
    callback(models);
  },

  sub: async (
    callback: (event: GameModel) => void,
    clauses: torii.EntityKeysClause[] = DEFAULT_KEYS_CLAUSES,
    historical: boolean = false,
  ) => {
    if (!Game.client) return;
    const wrappedCallback = (_fetchedEntities: any, event: any) => {
      if (!event[MODEL_NAME]) return;
      const model = event[MODEL_NAME];
      const gameModel = GameModel.from(model);
      callback(gameModel);
    };
    const subscription = async () => {
      if (!Game.client) return;
      return Game.client.onEventMessageUpdated(clauses, historical, wrappedCallback);
    };
    subscription()
      .then((sync) => (Game.unsubscribe = sync))
      .catch((error) => console.error("Error setting up entity sync:", error));
  },

  unsub: () => {
    if (!Game.unsubscribe) return;
    Game.unsubscribe.cancel();
    Game.unsubscribe = undefined;
  },
};
