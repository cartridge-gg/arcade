import { NAMESPACE } from "../../constants";
import { shortString, getChecksumAddress } from "starknet";
import type { SchemaType } from "../../bindings";
import { MemberClause, type ParsedEntity } from "@dojoengine/sdk";
import { Config } from "../../classes/config";
import { Attributes, Properties, Socials } from "../../classes";

const MODEL_NAME = "Edition";

export class EditionModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public worldAddress: string,
    public namespace: string,
    public published: boolean,
    public whitelisted: boolean,
    public priority: number,
    public gameId: number,
    public config: Config,
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
    public certified?: boolean,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.worldAddress = worldAddress;
    this.namespace = namespace;
    this.published = published;
    this.whitelisted = whitelisted;
    this.priority = priority;
    this.gameId = gameId;
    this.config = config;
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
    this.certified = !!certified;
  }

  static from(identifier: string, model: any) {
    if (!model) return EditionModel.default(identifier);
    const id = Number(model.id);
    const worldAddress = getChecksumAddress(model.world_address);
    const namespace = shortString.decodeShortString(
      `0x${BigInt(model.namespace).toString(16)}`,
    );
    const published = !!model.published;
    const whitelisted = !!model.whitelisted;
    const priority = Number(model.priority);
    const gameId = Number(model.game_id);
    const config = Config.from(
      model.config.replace('"{', "{").replace('}"', "}"),
    );
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
    return new EditionModel(
      identifier,
      id,
      worldAddress,
      namespace,
      published,
      whitelisted,
      priority,
      gameId,
      config,
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
    return new EditionModel(
      identifier,
      0,
      "0x0",
      "",
      false,
      false,
      0,
      0,
      Config.default(),
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

  static isType(model: EditionModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.worldAddress !== "0x0";
  }

  clone(): EditionModel {
    return new EditionModel(
      this.identifier,
      this.id,
      this.worldAddress,
      this.namespace,
      this.published,
      this.whitelisted,
      this.priority,
      this.gameId,
      this.config,
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
      this.certified,
    );
  }
}

export const Edition = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return EditionModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(
      `${NAMESPACE}-${Edition.getModelName()}`,
      "world_address",
      "Neq",
      "0x0",
    );
  },

  getMethods: () => [
    {
      name: "register_edition",
      entrypoint: "register_edition",
      description: "Register an edition.",
    },
    {
      name: "update_edition",
      entrypoint: "update_edition",
      description: "Update edition.",
    },
    {
      name: "prioritize_edition",
      entrypoint: "prioritize_edition",
      description: "Set edition priority.",
    },
    {
      name: "publish_edition",
      entrypoint: "publish_edition",
      description: "Publish edition.",
    },
    {
      name: "hide_edition",
      entrypoint: "hide_edition",
      description: "Hide edition.",
    },
    {
      name: "whitelist_edition",
      entrypoint: "whitelist_edition",
      description: "Whitelist edition.",
    },
    {
      name: "blacklist_edition",
      entrypoint: "blacklist_edition",
      description: "Blacklist edition.",
    },
    {
      name: "remove_edition",
      entrypoint: "remove_edition",
      description: "Remove edition.",
    },
  ],
};
