import { NAMESPACE } from "../../constants";
import { SchemaType } from "../../bindings";
import { MemberClause, ParsedEntity } from "@dojoengine/sdk";
import { getChecksumAddress } from "starknet";

const MODEL_NAME = "Member";

export class MemberModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: string,
    public role: number,
    public guildId: number,
    public pendingGuildId: number,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.role = role;
    this.guildId = guildId;
    this.pendingGuildId = pendingGuildId;
  }

  static from(identifier: string, model: any) {
    if (!model) return MemberModel.default(identifier);
    const id = getChecksumAddress(model.id);
    const role = Number(model.role);
    const guildId = Number(model.guild_id);
    const pendingGuildId = Number(model.pending_guild_id);
    return new MemberModel(identifier, id, role, guildId, pendingGuildId);
  }

  static isType(model: MemberModel) {
    return model.type === MODEL_NAME;
  }

  static default(identifier: string) {
    return new MemberModel(identifier, "0x0", 0, 0, 0);
  }

  exists() {
    return this.id !== "0x0";
  }
}

export const Member = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return MemberModel.from(entity.entityId, entity.models[NAMESPACE]?.[MODEL_NAME]);
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(`${NAMESPACE}-${Member.getModelName()}`, "id", "Neq", "0x0");
  },

  getMethods: () => [],
};
