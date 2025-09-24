import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { addAddressPadding } from "starknet";
import type { Subscription } from "@dojoengine/torii-wasm/types";
import type { Clause } from "@dojoengine/torii-wasm/types";
import type { SchemaType, setupWorld } from "@cartridge/models";
import {
  filterMetadataByTraits,
  getCollectionMetadataQuery,
  getMetadataStatistics,
  subscribeToMetadataUpdatesClause,
  type TokenMetadataUI,
  transformCollectionMetadataForUI,
} from "../queries";

interface QueryInterface {
  collectionAddress: string;
  identity: string;
}

/**
 * Hook to manage subscription lifecycle for metadata updates
 */
function useMetadataSubscription(
  subscriptionClause: Clause,
  queryKey: (string | QueryInterface)[],
) {
  const { sdk } = useDojoSDK<typeof setupWorld, SchemaType>();
  const subscriptionRef = useRef<Subscription | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (subscriptionRef.current === null) {
      const wrappedCallback = () => {
        queryClient.invalidateQueries({
          queryKey,
        });
      };

      sdk.client
        .onEntityUpdated(subscriptionClause, wrappedCallback)
        .then((s) => {
          subscriptionRef.current = s;
        });
    }

    return () => {
      if (subscriptionRef.current !== null) {
        subscriptionRef.current.free();
        subscriptionRef.current = null;
      }
    };
  }, [sdk, queryClient, queryKey, subscriptionClause]);
}

/**
 * Hook to fetch collection metadata
 */
export function useCollectionMetadata(
  collectionAddress: string,
  identity?: string,
) {
  const { sdk } = useDojoSDK<typeof setupWorld, SchemaType>();

  const paddedIdentity = useMemo(
    () => identity || addAddressPadding("0x0"),
    [identity],
  );

  const query = useMemo(
    () => getCollectionMetadataQuery(paddedIdentity, collectionAddress),
    [paddedIdentity, collectionAddress],
  );

  const queryKey: (string | QueryInterface)[] = useMemo(
    () => [
      "collectionMetadata",
      { collectionAddress, identity: paddedIdentity },
    ],
    [collectionAddress, paddedIdentity],
  );

  const subscriptionClause = useMemo(
    () =>
      subscribeToMetadataUpdatesClause(
        paddedIdentity,
        collectionAddress,
        undefined,
      ),
    [paddedIdentity, collectionAddress],
  );

  useMetadataSubscription(subscriptionClause, queryKey as QueryInterface[]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await sdk.getEntities({ query });
      const entities = response.getItems();
      return transformCollectionMetadataForUI(collectionAddress, entities);
    },
    enabled: !!collectionAddress,
    initialData: null,
  });
}

export function useMetadataFilters(
  collectionAddress: string,
  identity: string,
  handleChange: (tokens: TokenMetadataUI[]) => void,
) {
  const { data: metadata } = useCollectionMetadata(collectionAddress, identity);
  const [tokens, _setTokens] = useState<TokenMetadataUI[]>(
    null === metadata ? [] : metadata.tokens,
  );

  const [selectedTraits, setSelectedTraits] = useState<
    { traitType: string; value: string }[]
  >([]);
  const [statistics, setStatistics] = useState(getMetadataStatistics(tokens));

  useEffect(() => {
    const filteredTokens = filterMetadataByTraits(tokens, selectedTraits);
    handleChange(filteredTokens);
    setStatistics(getMetadataStatistics(filteredTokens));
  }, [tokens, handleChange, selectedTraits]);

  const toggleTrait = useCallback((traitType: string, value: string) => {
    setSelectedTraits((prev) => {
      const exists = prev.some(
        (t) => t.traitType === traitType && t.value === value,
      );

      if (exists) {
        return prev.filter(
          (t) => !(t.traitType === traitType && t.value === value),
        );
      }
      return [...prev, { traitType, value }];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedTraits([]);
    setStatistics(getMetadataStatistics(tokens));
  }, [tokens]);

  const isTraitSelected = useCallback(
    (traitType: string, value: string) => {
      return selectedTraits.some(
        (t) => t.traitType === traitType && t.value === value,
      );
    },
    [selectedTraits],
  );

  return {
    selectedTraits,
    statistics,
    toggleTrait,
    clearFilters,
    isTraitSelected,
  };
}
