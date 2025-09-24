import { NAMESPACE } from "../../constants";
import type { SchemaType } from "@cartridge/models";
import { MemberClause, ParsedEntity } from "@dojoengine/sdk";
import { Properties, Socials } from "../../classes";

const MODEL_NAME = "Alliance";

export class AllianceModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public open: boolean,
    public free: boolean,
    public guildCount: number,
    public metadata: Properties,
    public socials: Socials,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.open = open;
    this.free = free;
    this.guildCount = guildCount;
    this.metadata = metadata;
    this.socials = socials;
  }

  static from(identifier: string, model: any) {
    if (!model) return AllianceModel.default(identifier);
    const id = Number(model.id);
    const open = !!model.open;
    const free = !!model.free;
    const guildCount = Number(model.guild_count);
    const metadata = Properties.from(model.metadata);
    const socials = Socials.from(model.socials);
    return new AllianceModel(identifier, id, open, free, guildCount, metadata, socials);
  }

  static default(identifier: string) {
    return new AllianceModel(identifier, 0, false, false, 0, Properties.default(), Socials.default());
  }

  static isType(model: AllianceModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.id !== 0;
  }
}

export const Alliance = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return AllianceModel.from(entity.entityId, entity.models[NAMESPACE]?.[MODEL_NAME]);
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(`${NAMESPACE}-${Alliance.getModelName()}`, "id", "Neq", "0x0");
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
