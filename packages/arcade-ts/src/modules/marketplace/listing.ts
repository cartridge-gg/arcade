import { NAMESPACE } from "../../constants";
import type { SchemaType } from "@cartridge/models";
import type { ParsedEntity } from "@dojoengine/sdk";
import { type MarketplaceModel, OrderModel, type OrderInterface } from "..";

const MODEL_NAME = "Listing";

export interface ListingInterface {
  order_id: number;
  order: OrderInterface;
  time: number;
}

export class ListingEvent {
  type = MODEL_NAME;

  constructor(
    public identifier: string,
    public id: number,
    public order: OrderModel,
    public time: number,
  ) {
    this.identifier = identifier;
    this.id = id;
    this.order = order;
    this.time = time;
  }

  static from(identifier: string, model: ListingInterface) {
    if (!model) return ListingEvent.default(identifier);
    const id = Number(model.order_id);
    const order = OrderModel.from(identifier, model.order);
    const time = Number(model.time);
    return new ListingEvent(identifier, id, order, time);
  }

  static default(identifier: string) {
    return new ListingEvent(identifier, 0, OrderModel.default(identifier), 0);
  }

  static isType(model: MarketplaceModel): boolean {
    return model.type === MODEL_NAME;
  }

  exists() {
    return this.time !== 0;
  }

  clone(): ListingEvent {
    return new ListingEvent(
      this.identifier,
      this.id,
      this.order.clone(),
      this.time,
    );
  }
}

export const Listing = {
  parse: (entity: ParsedEntity<SchemaType>) => {
    return ListingEvent.from(
      entity.entityId,
      entity.models[NAMESPACE]?.[MODEL_NAME] as ListingInterface,
    );
  },

  getModelName: () => {
    return MODEL_NAME;
  },

  getMethods: () => [],
};
