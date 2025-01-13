import { NAMESPACE } from "../../constants";
import { shortString, addAddressPadding } from "starknet";
import { SchemaType } from "../../bindings";
import { ParsedEntity, QueryBuilder, SDK, StandardizedQueryResult } from "@dojoengine/sdk";

const MODEL_NAME = "Game";

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

  static from(model: any) {
    const worldAddress = addAddressPadding(model.world_address);
    const namespace = shortString.decodeShortString(`0x${BigInt(model.namespace).toString(16)}`);
    const project = shortString.decodeShortString(`0x${BigInt(model.project).toString(16)}`);
    const active = !!model.active;
    const published = !!model.published;
    const whitelisted = !!model.whitelisted;
    const priority = Number(model.priority);
    const karma = Number(model.karma);
    const metadata = Metadata.from(model.metadata);
    const socials = Socials.from(model.socials);
    const owner = addAddressPadding(model.owner);
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
    try {
      const json = JSON.parse(value);
      return new Metadata(json.color, json.name, json.description, json.image, json.banner);
    } catch (error) {
      console.error("Error parsing metadata:", value);
      return new Metadata("", "", "", "", "");
    }
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
    try {
      const json = JSON.parse(value);
      return new Socials(json.discord, json.telegram, json.twitter, json.youtube, json.website);
    } catch (error) {
      console.error("Error parsing socials:", value);
      return new Socials("", "", "", "", "");
    }
  }
}

export const Game = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubscribe: undefined as (() => void) | undefined,

  init: (sdk: SDK<SchemaType>) => {
    Game.sdk = sdk;
  },

  fetch: async (callback: (models: GameModel[]) => void) => {
    if (!Game.sdk) return;

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
        GameModel.from(entity.models[NAMESPACE][MODEL_NAME]),
      );
      callback(models);
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("world_address", "0x0")))
      .build();

    await Game.sdk.getEntities({ query, callback: wrappedCallback });
  },

  sub: async (callback: (event: GameModel) => void) => {
    if (!Game.sdk) return;

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
      callback(GameModel.from(entity.models[NAMESPACE][MODEL_NAME]));
    };

    const query = new QueryBuilder<SchemaType>()
      .namespace(NAMESPACE, (namespace) => namespace.entity(MODEL_NAME, (entity) => entity.neq("world_address", "0x0")))
      .build();

    const subscription = await Game.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Game.unsubscribe = () => subscription.cancel();
  },

  unsub: () => {
    if (!Game.unsubscribe) return;
    Game.unsubscribe();
    Game.unsubscribe = undefined;
  },
};