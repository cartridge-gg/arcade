import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDojoSDK } from "@dojoengine/sdk/react";
import {
	subscribeToTokenUpdatesClause,
	getTokenOrders,
	getListedTokensForCollection,
	isTokenListed,
} from "../queries/token";
import { SDKOrder, type OrderModel } from "../modules/marketplace";
import type { SchemaType, setupWorld } from "../bindings";
import { useEffect, useMemo, useRef } from "react";
import type { Subscription } from "@dojoengine/torii-wasm/types";
import type { Clause } from "@dojoengine/torii-wasm/types";

/**
 * Hook to manage subscription lifecycle for entity updates
 */
export function useEntitySubscription(
	subscriptionClause: Clause,
	queryKey: any[],
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
 * Hook to fetch all buy orders for a specific token
 */
export function useTokenOrders(collectionAddress: string, tokenId: string) {
	const { sdk } = useDojoSDK<typeof setupWorld, SchemaType>();
	const q = useMemo(
		() => getTokenOrders(collectionAddress, tokenId),
		[collectionAddress, tokenId],
	);
	const queryKey = useMemo(
		() => ["tokenOrders", { collectionAddress, tokenId }],
		[collectionAddress, tokenId],
	);
	const subscriptionClause = useMemo(
		() => subscribeToTokenUpdatesClause(collectionAddress, tokenId),
		[collectionAddress, tokenId],
	);

	useEntitySubscription(subscriptionClause, queryKey);

	return useQuery({
		queryKey,
		queryFn: async () => {
			const res = await sdk.getEntities({ query: q });
			return res.getItems().map((i) => SDKOrder.parse(i));
		},
		enabled: !!collectionAddress && !!tokenId,
	});
}

/**
 * Hook to fetch all listed tokens for a collection
 */
export function useListedTokensForCollection(collectionAddress: string) {
	const { sdk } = useDojoSDK<typeof setupWorld, SchemaType>();

	const q = useMemo(
		() => getListedTokensForCollection(collectionAddress),
		[collectionAddress],
	);
	const queryKey = useMemo(
		() => ["listedTokens", collectionAddress],
		[collectionAddress],
	);
	const subscriptionClause = useMemo(
		() => subscribeToTokenUpdatesClause(collectionAddress, undefined),
		[collectionAddress],
	);

	useEntitySubscription(subscriptionClause, queryKey);

	return useQuery({
		queryKey,
		queryFn: async () => {
			const res = await sdk.getEntities({ query: q });
			return res.getItems().map((i) => SDKOrder.parse(i));
		},
		enabled: !!collectionAddress,
	});
}

/**
 * Hook to check if a specific token is listed and fetch its listing details
 */
export function useIsTokenListed(collectionAddress: string, tokenId: string) {
	const { sdk } = useDojoSDK<typeof setupWorld, SchemaType>();

	const q = useMemo(
		() => isTokenListed(collectionAddress, tokenId),
		[collectionAddress, tokenId],
	);
	const queryKey = useMemo(
		() => ["isTokenListed", collectionAddress, tokenId],
		[collectionAddress, tokenId],
	);
	const subscriptionClause = useMemo(
		() => subscribeToTokenUpdatesClause(collectionAddress, tokenId),
		[collectionAddress, tokenId],
	);

	useEntitySubscription(subscriptionClause, queryKey);

	return useQuery({
		queryKey,
		queryFn: async () => {
			const res = await sdk.getEntities({ query: q });
			const items = res.getItems().map((i) => SDKOrder.parse(i));
			return {
				isListed: items.length > 0,
				listing: items[0] || null,
			};
		},
		enabled: !!collectionAddress && !!tokenId,
		initialData: { isListed: false, listing: null } as {
			isListed: boolean;
			listing: OrderModel | null;
		},
	});
}
