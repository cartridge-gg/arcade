import { useCallback, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import type { Token } from "@dojoengine/torii-wasm";
import type { OrderModel } from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { useMarketplaceTokensStore } from "@/store";
import { useMarketTokensFetcher } from "@/hooks/marketplace-tokens-fetcher";
import { DEFAULT_PROJECT } from "@/constants";

interface UseTokenDetailViewModelArgs {
  collectionAddress: string;
  tokenId: string;
}

interface TokenDetailViewModel {
  token: Token | undefined;
  collection: ReturnType<typeof useMarketTokensFetcher>["collection"];
  orders: OrderModel[];
  isLoading: boolean;
  isOwner: boolean;
  isListed: boolean;
  handleBuy: () => Promise<void>;
  handleList: () => Promise<void>;
  handleUnlist: () => Promise<void>;
  handleSend: () => Promise<void>;
}

export function useTokenDetailViewModel({
  collectionAddress,
  tokenId,
}: UseTokenDetailViewModelArgs): TokenDetailViewModel {
  const { address } = useAccount();
  const { getCollectionOrders } = useMarketplace();

  const getTokens = useMarketplaceTokensStore((state) => state.getTokens);
  const rawTokens = getTokens(DEFAULT_PROJECT, collectionAddress);

  const defaultProjects = useMemo(() => [DEFAULT_PROJECT], []);

  const { collection, status } = useMarketTokensFetcher({
    project: defaultProjects,
    address: collectionAddress,
  });

  const token = useMemo(() => {
    if (!rawTokens) return undefined;
    return rawTokens.find((t) => {
      const tid = t.token_id?.toString();
      return tid === tokenId || tid === `0x${tokenId}`;
    });
  }, [rawTokens, tokenId]);

  const collectionOrders = useMemo(() => {
    return getCollectionOrders(collectionAddress);
  }, [getCollectionOrders, collectionAddress]);

  const orders = useMemo(() => {
    if (!collectionOrders || !tokenId) return [];

    const candidates = new Set<string>();
    candidates.add(tokenId);

    try {
      if (tokenId.startsWith("0x")) {
        const numericId = BigInt(tokenId).toString();
        candidates.add(numericId);
      } else {
        candidates.add(`0x${BigInt(tokenId).toString(16)}`);
      }
    } catch (error) {
      // Ignore parse errors
    }

    for (const candidate of candidates) {
      const tokenOrders = collectionOrders[candidate];
      if (tokenOrders?.length) {
        return tokenOrders;
      }
    }

    return [];
  }, [collectionOrders, tokenId]);

  const isOwner = useMemo(() => {
    if (!address || !token) return false;
    return true;
  }, [address, token]);

  const isListed = useMemo(() => {
    return orders.length > 0;
  }, [orders]);

  const isLoading = status === "loading" || status === "idle";

  const handleBuy = useCallback(async () => {
    console.log("Buy clicked");
  }, []);

  const handleList = useCallback(async () => {
    console.log("List clicked");
  }, []);

  const handleUnlist = useCallback(async () => {
    console.log("Unlist clicked");
  }, []);

  const handleSend = useCallback(async () => {
    console.log("Send clicked");
  }, []);

  return {
    token,
    collection,
    orders,
    isLoading,
    isOwner,
    isListed,
    handleBuy,
    handleList,
    handleUnlist,
    handleSend,
  };
}
