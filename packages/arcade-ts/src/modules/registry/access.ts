import { NAMESPACE } from "../../constants";
import { getChecksumAddress } from "starknet";
import type { SchemaType } from "@cartridge/models";
import { MemberClause, ParsedEntity } from "@dojoengine/sdk";
import { Role, RoleType } from "../../classes";

const MODEL_NAME = "Access";

export class AccessModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public address: string,
    public role: Role,
  ) {
    this.identifier = identifier;
    this.address = address;
    this.role = role;
  }

  static from(identifier: string, model: any) {
    if (!model) return AccessModel.default(identifier);
    const address = getChecksumAddress(model.address);
    const role = Role.from(model.role);
    return new AccessModel(identifier, address, role);
  }

  static default(identifier: string) {
    return new AccessModel(identifier, "0x0", new Role(RoleType.None));
  }

  static isType(model: AccessModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.role.value !== RoleType.None;
  }

  clone(): AccessModel {
    return new AccessModel(this.identifier, this.address, this.role);
  }
}

export const Access = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return AccessModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME],
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(
      `${NAMESPACE}-${Access.getModelName()}`,
      "world_address",
      "Neq",
      "0x0",
    );
  },

  getMethods: () => [],
};
