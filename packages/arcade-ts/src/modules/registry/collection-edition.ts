import { NAMESPACE } from "../../constants";
import { getChecksumAddress } from "starknet";
import type { SchemaType } from "../../bindings";
import { MemberClause, ParsedEntity } from "@dojoengine/sdk";

const MODEL_NAME = "CollectionEdition";

export class CollectionEditionModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public collection: string,
    public edition: string,
    public active: boolean,
  ) {
    this.identifier = identifier;
    this.collection = collection;
    this.edition = edition;
    this.active = !!active;
  }

  static from(identifier: string, model: any) {
    if (!model) return CollectionEditionModel.default(identifier);
    const collection = getChecksumAddress(model.collection);
    const edition = getChecksumAddress(model.edition);
    const active = !!model.active;
    return new CollectionEditionModel(identifier, collection, edition, active);
  }

  static default(identifier: string) {
    return new CollectionEditionModel(identifier, "0x0", "0x0", false);
  }

  static isType(model: CollectionEditionModel) {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.active;
  }

  clone(): CollectionEditionModel {
    return new CollectionEditionModel(this.identifier, this.collection, this.edition, this.active);
  }
}

export const CollectionEdition = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return CollectionEditionModel.from(entity.entityId, entity.models[NAMESPACE]?.[MODEL_NAME]);
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getClause: () => {
    return MemberClause(`${NAMESPACE}-${CollectionEdition.getModelName()}`, "collection", "Neq", "0x0");
  },

  getMethods: () => [],
};
