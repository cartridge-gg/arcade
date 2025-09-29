import { NAMESPACE } from "../../constants";
import type { SchemaType } from "../../bindings";
import { MemberClause, ParsedEntity } from "@dojoengine/sdk";
import { Attributes, Properties, Socials } from "../../classes";

const MODEL_NAME = "Game";

export class GameModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public published: boolean,
    public whitelisted: boolean,
    public color: string,
    public image: string,
    public image_data: string,
    public external_url: string,
    public description: string,
    public name: string,
    public animation_url: string,
    public youtube_url: string,
    public attributes: Attributes,
    public properties: Properties,
    public socials: Socials,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.published = published;
    this.whitelisted = whitelisted;
    this.color = color;
    this.image = image;
    this.image_data = image_data;
    this.external_url = external_url;
    this.description = description;
    this.name = name;
    this.animation_url = animation_url;
    this.youtube_url = youtube_url;
    this.attributes = attributes;
    this.properties = properties;
    this.socials = socials;
  }

  static from(identifier: string, model: any) {
    if (!model) return GameModel.default(identifier);
    const id = Number(model.id);
    const published = !!model.published;
    const whitelisted = !!model.whitelisted;
    const color = model.color;
    const image = model.image;
    const image_data = model.image_data;
    const external_url = model.external_url;
    const description = model.description;
    const name = model.name;
    const animation_url = model.animation_url;
    const youtube_url = model.youtube_url;
    const attributes = Attributes.from(model.attributes);
    const properties = Properties.from(model.properties);
    const socials = Socials.from(model.socials);
    return new GameModel(
      identifier,
      id,
      published,
      whitelisted,
      color,
      image,
      image_data,
      external_url,
      description,
      name,
      animation_url,
      youtube_url,
      attributes,
      properties,
      socials,
    );
  }

  static default(identifier: string) {
    return new GameModel(
      identifier,
      0,
      false,
      false,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      Attributes.default(),
      Properties.default(),
      Socials.default(),
    );
  }

  static isType(model: GameModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.name !== "";
  }

  clone(): GameModel {
    return new GameModel(
      this.identifier,
      this.id,
      this.published,
      this.whitelisted,
      this.color,
      this.image,
      this.image_data,
      this.external_url,
      this.description,
      this.name,
      this.animation_url,
      this.youtube_url,
      this.attributes.clone(),
      this.properties.clone(),
      this.socials.clone(),
    );
  }
}

export const Game = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return GameModel.from(entity.entityId, entity.models[NAMESPACE]?.[MODEL_NAME]);
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(`${NAMESPACE}-${Game.getModelName()}`, "name", "Neq", "");
  },

  getMethods: () => [
    { name: "register_game", entrypoint: "register_game", description: "Register a game." },
    { name: "update_game", entrypoint: "update_game", description: "Update a game." },
    { name: "publish_game", entrypoint: "publish_game", description: "Publish a game." },
    { name: "hide_game", entrypoint: "hide_game", description: "Hide a game." },
    { name: "whitelist_game", entrypoint: "whitelist_game", description: "Whitelist a game." },
    { name: "blacklist_game", entrypoint: "blacklist_game", description: "Blacklist a game." },
    { name: "remove_game", entrypoint: "remove_game", description: "Remove a game." },
  ],
};
