import { useCallback, useMemo } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { useRouterState } from "@tanstack/react-router";
import type { Token } from "@/types/torii";
import type { OrderModel } from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { useMarketplaceTokensStore } from "@/store";
import { useMarketTokensFetcher } from "@/hooks/marketplace-tokens-fetcher";
import { useMarketBalancesFetcher } from "@/hooks/marketplace-balances-fetcher";
import { DEFAULT_PRESET, DEFAULT_PROJECT } from "@/constants";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useArcade } from "@/hooks/arcade";
import { ERC1155_ENTRYPOINT, getEntrypoints } from "../items";
import type ControllerConnector from "@cartridge/connector/controller";
import { useAccountByAddress } from "@/collections";
import { NavigationContextManager } from "@/features/navigation/NavigationContextManager";

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
  owner: string;
  controller: { address: string; username: string } | null;
  collectionHref: string;
  handleBuy: () => Promise<void>;
  handleList: () => Promise<void>;
  handleUnlist: () => Promise<void>;
  handleSend: () => Promise<void>;
}

export function useTokenDetailViewModel({
  collectionAddress,
  tokenId,
}: UseTokenDetailViewModelArgs): TokenDetailViewModel {
  const { connector } = useConnect();
  const { address, isConnected } = useAccount();
  const { getCollectionOrders } = useMarketplace();
  const { trackEvent, events } = useAnalytics();
  const { provider, games, editions } = useArcade();
  const { location } = useRouterState();

  const defaultProjects = useMemo(() => [DEFAULT_PROJECT], []);

  const { collection, status } = useMarketTokensFetcher({
    project: defaultProjects,
    address: collectionAddress,
    tokenIds: [tokenId],
  });

  const { balances } = useMarketBalancesFetcher({
    project: defaultProjects,
    address: collectionAddress,
    tokenId,
  });
  const owner = useMemo(
    () =>
      balances && balances.length === 1
        ? addAddressPadding(balances[0].account_address)
        : "0x0",
    [balances],
  );
  const isOwner = useMemo(
    () =>
      undefined !== address &&
      getChecksumAddress(addAddressPadding(address)) ===
        getChecksumAddress(addAddressPadding(owner)),
    [address, owner],
  );
  const { data: controllerName } = useAccountByAddress(owner);

  const rawTokens = useMarketplaceTokensStore(
    (state) => state.tokens[DEFAULT_PROJECT]?.[collectionAddress],
  );

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
      candidates.add(BigInt(`0x${tokenId}`).toString());
    }

    for (const candidate of candidates) {
      const tokenOrders = collectionOrders[candidate];
      if (tokenOrders?.length) {
        return tokenOrders;
      }
    }

    return [];
  }, [collectionOrders, tokenId]);

  const isListed = useMemo(() => {
    return orders.length > 0;
  }, [orders]);

  const isLoading = status === "loading" || status === "idle";

  const navManager = useMemo(
    () =>
      new NavigationContextManager({
        pathname: location.pathname,
        games,
        editions,
        isLoggedIn: Boolean(isConnected),
      }),
    [location.pathname, games, editions, isConnected],
  );

  const collectionHref = useMemo(
    () => navManager.generateCollectionHref(collectionAddress),
    [navManager, collectionAddress],
  );

  const handleBuy = useCallback(async () => {
    if (!isConnected || !connector) return;

    const eventType = events.MARKETPLACE_PURCHASE_INITIATED;

    trackEvent(eventType, {
      purchase_type: "single",
      items_count: 1,
      order_ids: orders.map((order) => order.id.toString()),
      collection_address: collectionAddress,
      buyer_address: address,
      item_token_ids: tokenId,
    });

    const controller = (connector as ControllerConnector)?.controller;
    const username = await controller?.username();
    if (!controller || !username) {
      console.error("Connector not initialized");
      trackEvent(events.MARKETPLACE_PURCHASE_FAILED, {
        error_message: "Connector not initialized",
        purchase_type: "single",
      });
      return;
    }

    const entrypoints = await getEntrypoints(
      provider.provider,
      collectionAddress,
    );
    const isERC1155 = entrypoints?.includes(ERC1155_ENTRYPOINT);
    const subpath = isERC1155 ? "collectible" : "collection";

    const project = DEFAULT_PROJECT;
    const preset = DEFAULT_PRESET;
    const options = [`ps=${project}`];
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push("preset=cartridge");
    }

    options.push(`address=${getChecksumAddress(owner)}`);
    options.push("purchaseView=true");
    options.push(`tokenIds=${[tokenId].join(",")}`);
    const path = `account/${username}/inventory/${subpath}/${addAddressPadding(collectionAddress)}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;

    controller.openProfileAt(path);
  }, [
    address,
    connector,
    events,
    isConnected,
    provider,
    tokenId,
    trackEvent,
    collectionAddress,
    orders,
    owner,
  ]);

  const handleList = useCallback(async () => {
    if (!isConnected || !connector) return;

    const controller = (connector as ControllerConnector)?.controller;
    const username = await controller?.username();
    if (!controller || !username) {
      console.error("Connector not initialized");
      return;
    }

    const entrypoints = await getEntrypoints(
      provider.provider,
      collectionAddress,
    );
    const isERC1155 = entrypoints?.includes(ERC1155_ENTRYPOINT);
    const subpath = isERC1155 ? "collectible" : "collection";

    const project = DEFAULT_PROJECT;
    const preset = DEFAULT_PRESET;
    const options = [`ps=${project}`];
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push("preset=cartridge");
    }

    options.push("listView=true");
    const path = `account/${username}/inventory/${subpath}/${collectionAddress}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;

    controller.openProfileAt(path);
  }, [connector, isConnected, provider, tokenId, collectionAddress]);

  const handleUnlist = useCallback(async () => {
    if (!isConnected || !connector) return;

    const controller = (connector as ControllerConnector)?.controller;
    const username = await controller?.username();
    if (!controller || !username) {
      console.error("Connector not initialized");
      return;
    }

    const entrypoints = await getEntrypoints(
      provider.provider,
      collectionAddress,
    );
    const isERC1155 = entrypoints?.includes(ERC1155_ENTRYPOINT);
    const subpath = isERC1155 ? "collectible" : "collection";

    const project = DEFAULT_PROJECT;
    const preset = DEFAULT_PRESET;
    const options = [`ps=${project}`];
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push("preset=cartridge");
    }

    options.push("unlistView=true");
    const path = `account/${username}/inventory/${subpath}/${collectionAddress}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;

    controller.openProfileAt(path);
  }, [connector, isConnected, provider, tokenId, collectionAddress]);

  const handleSend = useCallback(async () => {
    if (!isConnected || !connector) return;

    const controller = (connector as ControllerConnector)?.controller;
    const username = await controller?.username();
    if (!controller || !username) {
      console.error("Connector not initialized");
      return;
    }

    const entrypoints = await getEntrypoints(
      provider.provider,
      collectionAddress,
    );
    const isERC1155 = entrypoints?.includes(ERC1155_ENTRYPOINT);
    const subpath = isERC1155 ? "collectible" : "collection";

    const project = DEFAULT_PROJECT;
    const preset = DEFAULT_PRESET;
    const options = [`ps=${project}`];
    if (preset) {
      options.push(`preset=${preset}`);
    } else {
      options.push("preset=cartridge");
    }

    options.push("sendView=true");
    const path = `account/${username}/inventory/${subpath}/${collectionAddress}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;

    controller.openProfileAt(path);
  }, [connector, isConnected, provider, tokenId, collectionAddress]);

  return {
    token,
    collection,
    orders,
    isLoading,
    isOwner,
    isListed,
    owner,
    controller: controllerName,
    collectionHref,
    handleBuy,
    handleList,
    handleUnlist,
    handleSend,
  };
}
