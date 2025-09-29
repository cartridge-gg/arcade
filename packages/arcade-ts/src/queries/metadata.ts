import { AndComposeClause, KeysClause, MemberClause, ToriiQueryBuilder } from "@dojoengine/sdk";
import { ModelsMapping } from "../bindings";
import { addAddressPadding, type BigNumberish } from "starknet";
import { NAMESPACE } from "../constants";

export function getTokenMetadataQuery(identity: string, collectionAddress: string, tokenId: BigNumberish) {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause(
        [ModelsMapping.MetadataAttribute],
        [addAddressPadding(identity), addAddressPadding(collectionAddress), tokenId.toString(), undefined],
        "FixedLen",
      ).build(),
    )
    .withEntityModels([ModelsMapping.MetadataAttribute])
    .addOrderBy("index", "Asc");
}

export function getCollectionMetadataQuery(identity: string, collectionAddress: string) {
  return new ToriiQueryBuilder()
    .withClause(
      KeysClause(
        [ModelsMapping.MetadataAttribute],
        [addAddressPadding(identity), addAddressPadding(collectionAddress), undefined, undefined, undefined],
        "FixedLen",
      ).build(),
    )
    .withEntityModels([ModelsMapping.MetadataAttribute])
    .addOrderBy("index", "Asc")
    .withLimit(100000);
}

export function getMetadataByTraitQuery(identity: string, collectionAddress: string, traitType: string) {
  return new ToriiQueryBuilder()
    .withClause(
      AndComposeClause([
        KeysClause(
          [ModelsMapping.MetadataAttribute],
          [addAddressPadding(identity), addAddressPadding(collectionAddress), undefined, undefined],
          "FixedLen",
        ),
        MemberClause(ModelsMapping.MetadataAttribute, "trait_type", "Eq", traitType),
      ]).build(),
    )
    .withEntityModels([ModelsMapping.MetadataAttribute])
    .addOrderBy("token_id", "Asc");
}

export function getMetadataByValueQuery(identity: string, collectionAddress: string, value: string) {
  return new ToriiQueryBuilder()
    .withClause(
      AndComposeClause([
        KeysClause(
          [ModelsMapping.MetadataAttribute],
          [addAddressPadding(identity), addAddressPadding(collectionAddress), undefined, undefined],
          "FixedLen",
        ),
        MemberClause(ModelsMapping.MetadataAttribute, "value", "Eq", value),
      ]).build(),
    )
    .withEntityModels([ModelsMapping.MetadataAttribute])
    .addOrderBy("token_id", "Asc");
}

export function subscribeToMetadataUpdatesClause(
  identity: string,
  collectionAddress: string,
  tokenId: BigNumberish | undefined,
) {
  return KeysClause(
    [ModelsMapping.MetadataAttribute],
    [addAddressPadding(identity), addAddressPadding(collectionAddress), tokenId?.toString(), undefined],
  ).build();
}

export type TokenMetadataUI = {
  tokenId: string;
  attributes: Array<{
    traitType: string;
    value: string;
  }>;
};

export type CollectionMetadataUI = {
  collectionAddress: string;
  tokens: TokenMetadataUI[];
};

export function transformMetadataForUI(metadataEntities: any[]): TokenMetadataUI[] {
  const tokenMap = new Map<string, TokenMetadataUI>();

  for (const entity of metadataEntities) {
    const metadata = entity.models?.[NAMESPACE].MetadataAttribute;
    if (!metadata) continue;

    const tokenId = `0x${metadata.token_id.toString(16)}`;

    if (!tokenMap.has(tokenId)) {
      tokenMap.set(tokenId, {
        tokenId,
        attributes: [],
      });
    }

    const token = tokenMap.get(tokenId);
    if (token) {
      token.attributes.push({
        traitType: metadata.trait_type,
        value: metadata.value,
      });
    }
  }

  return Array.from(tokenMap.values()).sort((a, b) => (BigInt(a.tokenId) > BigInt(b.tokenId) ? 1 : -1));
}

export function transformCollectionMetadataForUI(
  collectionAddress: string,
  metadataEntities: any[],
): CollectionMetadataUI {
  return {
    collectionAddress,
    tokens: transformMetadataForUI(metadataEntities),
  };
}

export function filterMetadataByTraits(
  metadata: TokenMetadataUI[],
  traitFilters: { traitType: string; value: string }[],
): TokenMetadataUI[] {
  return metadata.filter((token) => {
    return traitFilters.every((filter) =>
      token.attributes.some((attr) => attr.traitType === filter.traitType && attr.value === filter.value),
    );
  });
}

export type MetadataStatistic = {
  traitType: string;
  values: Array<{
    value: string;
    count: number;
    percentage: number;
  }>;
};
export type MetadataStatistics = MetadataStatistic[];
export function getMetadataStatistics(metadata: TokenMetadataUI[]): MetadataStatistics {
  const traitStats = new Map<string, Map<string, number>>();

  for (const token of metadata) {
    for (const attr of token.attributes) {
      if (!traitStats.has(attr.traitType)) {
        traitStats.set(attr.traitType, new Map());
      }
      const valueMap = traitStats.get(attr.traitType);
      if (valueMap) {
        valueMap.set(attr.value, (valueMap.get(attr.value) || 0) + 1);
      }
    }
  }

  const stats: Array<{
    traitType: string;
    values: Array<{ value: string; count: number; percentage: number }>;
  }> = [];

  traitStats.forEach((valueMap, traitType) => {
    const values = Array.from(valueMap.entries())
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / metadata.length) * 100,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));

    stats.push({ traitType, values });
  });

  return stats.sort((a, b) => a.traitType.localeCompare(b.traitType));
}
