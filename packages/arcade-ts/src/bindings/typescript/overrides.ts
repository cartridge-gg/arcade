export enum OrderCategory {
  None = 0,
  Buy = 1,
  Sell = 2,
  BuyAny = 3,
}
export enum OrderStatus {
  None = 0,
  Placed = 1,
  Canceled = 2,
  Executed = 3,
}
export const ArcadeModelsMapping = {
  Book: "ARCADE-Book",
  MetadataAttribute: "ARCADE-MetadataAttribute",
  Moderator: "ARCADE-Moderator",
  Order: "ARCADE-Order",
  Listing: "ARCADE-Listing",
  Offer: "ARCADE-Offer",
  Sale: "ARCADE-Sale",
} as const;

export const MetadataAttributeTypedData = [
  {
    name: "identity",
    type: "felt",
  },
  {
    name: "collection",
    type: "felt",
  },
  {
    name: "token_id",
    type: "u256",
  },
  {
    name: "index",
    type: "u256",
  },
  {
    name: "trait_type",
    type: "bytearray",
  },
  {
    name: "value",
    type: "bytearray",
  },
];
