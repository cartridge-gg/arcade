import { NAMESPACE } from "../../constants";
import { getChecksumAddress } from "starknet";
import type { SchemaType } from "@cartridge/models";
import type { ParsedEntity } from "@dojoengine/sdk";
import type { MarketplaceModel } from ".";

const MODEL_NAME = "Book";

export interface BookInterface {
  id: number;
  version: number;
  paused: boolean;
  counter: number;
  fee_num: number;
  fee_receiver: string;
}

export class BookModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public version: number,
    public paused: boolean,
    public counter: number,
    public fee_num: number,
    public fee_receiver: string,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.version = version;
    this.paused = paused;
    this.counter = counter;
    this.fee_num = fee_num;
    this.fee_receiver = fee_receiver;
  }

  static from(identifier: string, model: BookInterface) {
    if (!model) return BookModel.default(identifier);
    const id = Number(model.id);
    const version = Number(model.version);
    const paused = model.paused;
    const counter = Number(model.counter);
    const fee_num = Number(model.fee_num);
    const fee_receiver = getChecksumAddress(model.fee_receiver);
    return new BookModel(
      identifier,
      id,
      version,
      paused,
      counter,
      fee_num,
      fee_receiver,
    );
  }

  static default(identifier: string) {
    return new BookModel(
      identifier,
      0,
      0,
      false,
      0,
      0,
      getChecksumAddress("0x0"),
    );
  }

  static isType(model: MarketplaceModel): boolean {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.version !== 0;
  }

  clone(): BookModel {
    return new BookModel(
      this.identifier,
      this.id,
      this.version,
      this.paused,
      this.counter,
      this.fee_num,
      this.fee_receiver,
    );
  }
}

export const Book = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return BookModel.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME] as BookInterface,
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [
    {
      name: "grant_role",
      entrypoint: "grant_role",
      description: "Grant a role.",
    },
    {
      name: "revoke_role",
      entrypoint: "revoke_role",
      description: "Revoke a role.",
    },
    { name: "pause", entrypoint: "pause", description: "Pause the orderbook." },
    {
      name: "resume",
      entrypoint: "resume",
      description: "Resume the orderbook.",
    },
    {
      name: "set_fee",
      entrypoint: "set_fee",
      description: "Update the orderbook fees.",
    },
  ],
};
