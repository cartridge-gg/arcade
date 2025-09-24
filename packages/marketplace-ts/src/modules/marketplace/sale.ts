import { NAMESPACE } from "../../constants";
import type { SchemaType } from "@cartridge/models";
import type { ParsedEntity } from "@dojoengine/sdk";
import { type MarketplaceModel, type OrderInterface, OrderModel } from "..";
import { getChecksumAddress } from "starknet";

const MODEL_NAME = "Sale";

export interface SaleInterface {
  order_id: number;
  order: OrderInterface;
  from: string;
  to: string;
  time: number;
}

export class SaleEvent {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public order: OrderModel,
    public from: string,
    public to: string,
    public time: number,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.order = order;
    this.from = from;
    this.to = to;
    this.time = time;
  }

  static from(identifier: string, model: SaleInterface) {
    if (!model) return SaleEvent.default(identifier);
    const id = Number(model.order_id);
    const order = OrderModel.from(identifier, model.order);
    const from = getChecksumAddress(model.from);
    const to = getChecksumAddress(model.to);
    const time = Number(model.time);
    return new SaleEvent(identifier, id, order, from, to, time);
  }

  static default(identifier: string) {
    const zero = getChecksumAddress("0x0");
    return new SaleEvent(
      identifier,
      0,
      OrderModel.default(identifier),
      zero,
      zero,
      0,
    );
  }

  static isType(model: MarketplaceModel): boolean {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.time !== 0;
  }

  clone(): SaleEvent {
    return new SaleEvent(
      this.identifier,
      this.id,
      this.order.clone(),
      this.from,
      this.to,
      this.time,
    );
  }
}

export const Sale = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return SaleEvent.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME] as SaleInterface,
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
