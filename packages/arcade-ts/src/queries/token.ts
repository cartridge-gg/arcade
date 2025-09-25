import {
  AndComposeClause,
  KeysClause,
  MemberClause,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import { ModelsMapping, OrderCategory, OrderStatus } from "../bindings";
import { addAddressPadding, type BigNumberish } from "starknet";

export function subscribeToTokenUpdatesClause(
  collectionAddress: string,
  tokenId: BigNumberish | undefined,
) {
  return KeysClause(
    [ModelsMapping.Order],
    [
      undefined,
      addAddressPadding(collectionAddress),
      tokenId?.toString(),
      undefined,
    ],
  ).build();
}
function getOrderBaseClause(
  collectionAddress: string,
  tokenId: BigNumberish | undefined,
  category: OrderCategory,
) {
  return AndComposeClause([
    KeysClause(
      [ModelsMapping.Order],
      [
        undefined,
        addAddressPadding(collectionAddress),
        tokenId?.toString(),
        undefined,
      ],
      "FixedLen",
    ),
    MemberClause(ModelsMapping.Order, "category", "Eq", category.toString()),
    MemberClause(
      ModelsMapping.Order,
      "status",
      "Eq",
      OrderStatus.Placed.toString(),
    ),
  ]);
}

// ToriiQuery to retrieve all marketplace informations related to input token.
export function getTokenQuery(collectionAddress: string, tokenId: string) {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause(
        [ModelsMapping.Order],
        [undefined, addAddressPadding(collectionAddress), tokenId, undefined],
      ).build(),
    )
    .includeHashedKeys()
    .withEntityModels([ModelsMapping.Order])
    .addOrderBy("expiration", "Asc");
}

// Get orders for given token
export function getTokenOrders(collectionAddress: string, tokenId: string) {
  return new ToriiQueryBuilder()
    .withClause(
      getOrderBaseClause(collectionAddress, tokenId, OrderCategory.Buy).build(),
    )
    .addOrderBy("expiration", "Desc")
    .withEntityModels([ModelsMapping.Order])
    .includeHashedKeys();
}

// Get all listed tokens for a collection
export function getListedTokensForCollection(collectionAddress: string) {
  return new ToriiQueryBuilder()
    .withClause(
      getOrderBaseClause(
        collectionAddress,
        undefined,
        OrderCategory.Sell,
      ).build(),
    )
    .addOrderBy("expiration", "Asc")
    .withEntityModels([ModelsMapping.Order])
    .includeHashedKeys();
}

// Get token if Listed
export function isTokenListed(collectionAddress: string, tokenId: string) {
  return new ToriiQueryBuilder()
    .withClause(
      getOrderBaseClause(
        collectionAddress,
        tokenId,
        OrderCategory.Sell,
      ).build(),
    )
    .withEntityModels([ModelsMapping.Order])
    .includeHashedKeys();
}
