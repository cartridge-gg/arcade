import { NAMESPACE } from "../../constants";
import { getChecksumAddress } from "starknet";
import type { SchemaType } from "@cartridge/models";
import type { ParsedEntity } from "@dojoengine/sdk";
import { Role, RoleType } from "../../classes";
import type { MarketplaceModel } from ".";

const MODEL_NAME = "Moderator";

export interface ModeratorInterface {
  address: string;
  role: number;
}

export class ModeratorModel {
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

  static from(identifier: string, model: ModeratorInterface) {
    if (!model) return ModeratorModel.default(identifier);
    const address = getChecksumAddress(model.address);
    const role = Role.from(model.role);
    return new ModeratorModel(identifier, address, role);
  }

  static default(identifier: string) {
    return new ModeratorModel(identifier, "0x0", new Role(RoleType.None));
  }

  static isType(model: MarketplaceModel): boolean {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.role.value !== RoleType.None;
  }

  clone(): ModeratorModel {
    return new ModeratorModel(this.identifier, this.address, this.role);
  }
}

export const Moderator = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return ModeratorModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME] as ModeratorInterface,
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
