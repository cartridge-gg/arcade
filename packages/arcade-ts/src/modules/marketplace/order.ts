import { NAMESPACE } from "../../constants";
import { getChecksumAddress } from "starknet";
import type { SchemaType } from "../../bindings";
import type { ParsedEntity } from "@dojoengine/sdk";
import { Category, CategoryType, Status, StatusType } from "../../classes";
import type { MarketplaceModel } from ".";

const MODEL_NAME = "Order";

export interface OrderInterface {
  id: number;
  category: number;
  status: number;
  expiration: number;
  collection: string;
  token_id: number;
  quantity: number;
  price: number;
  currency: string;
  owner: string;
}

export class OrderModel {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public category: Category,
    public status: Status,
    public expiration: number,
    public collection: string,
    public tokenId: number,
    public quantity: number,
    public price: number,
    public currency: string,
    public owner: string,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.category = category;
    this.status = status;
    this.expiration = expiration;
    this.collection = collection;
    this.tokenId = tokenId;
    this.quantity = quantity;
    this.price = price;
    this.currency = currency;
    this.owner = owner;
  }

  static from(identifier: string, model: OrderInterface) {
    if (!model) return OrderModel.default(identifier);
    const id = Number(model.id);
    const category = Category.from(model.category);
    const status = Status.from(model.status);
    const expiration = Number(model.expiration);
    const collection = getChecksumAddress(model.collection);
    const tokenId = Number(model.token_id);
    const quantity = Number(model.quantity);
    const price = Number(model.price);
    const currency = getChecksumAddress(model.currency);
    const owner = getChecksumAddress(model.owner);
    return new OrderModel(
      identifier,
      id,
      category,
      status,
      expiration,
      collection,
      tokenId,
      quantity,
      price,
      currency,
      owner,
    );
  }

  static default(identifier: string) {
    return new OrderModel(
      identifier,
      0,
      new Category(CategoryType.None),
      new Status(StatusType.None),
      0,
      getChecksumAddress("0x0"),
      0,
      0,
      0,
      getChecksumAddress("0x0"),
      getChecksumAddress("0x0"),
    );
  }

  static isType(model: MarketplaceModel): boolean {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.status.value !== StatusType.None;
  }

  clone(): OrderModel {
    return new OrderModel(
      this.identifier,
      this.id,
      this.category,
      this.status,
      this.expiration,
      this.collection,
      this.tokenId,
      this.quantity,
      this.price,
      this.currency,
      this.owner,
    );
  }
}

export const Order = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return OrderModel.from(entity.entityId, entity.models[NAMESPACE]?.[MODEL_NAME] as OrderInterface);
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [
    { name: "list", entrypoint: "list", description: "List an item." },
    { name: "offer", entrypoint: "offer", description: "Make an offer." },
    {
      name: "cancel",
      entrypoint: "cancel",
      description: "Cancel an order.",
    },
    {
      name: "delete",
      entrypoint: "delete",
      description: "Delete an order.",
    },
    {
      name: "execute",
      entrypoint: "execute",
      description: "Execute an order.",
    },
  ],
};
