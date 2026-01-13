import { useCallback, useMemo } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { useMarketBalancesFetcher } from "@/hooks/marketplace-balances-fetcher";
import { DEFAULT_PRESET, DEFAULT_PROJECT } from "@/constants";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useArcade } from "@/hooks/arcade";
import {
  ERC1155_ENTRYPOINT,
  getEntrypoints,
} from "@/features/marketplace/items";
import type ControllerConnector from "@cartridge/connector/controller";
import { collectionOrdersAtom } from "@/effect/atoms";
import { useAtomValue } from "@effect-atom/atom-react";
import { useConnectionViewModel } from "@/features/connection";

export function useHandleBuyCallback(
  collectionAddress: string,
  tokenId: string,
): () => Promise<void> {
  const { connector } = useConnect();
  const { address, isConnected } = useAccount();
  const { onConnect, isConnectDisabled } = useConnectionViewModel();
  const { trackEvent, events } = useAnalytics();
  const { provider } = useArcade();

  const { balances } = useMarketBalancesFetcher({
    project: [DEFAULT_PROJECT],
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

  const collectionOrders = useAtomValue(
    collectionOrdersAtom(collectionAddress),
  );

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

  const handleBuyCallback = useCallback(async () => {
    if (!isConnected) {
      if (isConnectDisabled) {
        return;
      }
      await onConnect();
    }

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
    options.push(`tokenIds=${[addAddressPadding(tokenId)].join(",")}`);
    const path = `account/${username}/inventory/${subpath}/${addAddressPadding(collectionAddress)}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;

    controller.openProfileAt(path);
  }, [
    address,
    connector,
    events,
    isConnected,
    isConnectDisabled,
    provider,
    tokenId,
    trackEvent,
    collectionAddress,
    orders,
    owner,
  ]);

  return handleBuyCallback;
}

export function useHandleListCallback(): (
  collectionAddress: string,
  tokenIds: string[],
) => Promise<void> {
  const { connector } = useConnect();
  const { isConnected } = useAccount();
  const { onConnect, isConnectDisabled } = useConnectionViewModel();
  const { provider } = useArcade();

  const handleListCallback = useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      if (!isConnected) {
        if (isConnectDisabled) {
          return;
        }
        await onConnect();
      }

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

      let path: string;

      if (tokenIds.length > 1) {
        tokenIds.forEach((tokenId) => {
          options.push(`tokenIds=${addAddressPadding(tokenId)}`);
        });
        path = `account/${username}/inventory/${subpath}/${collectionAddress}/list?${options.join("&")}`;
      } else {
        const [tokenId] = tokenIds;
        options.push("listView=true");
        path = `account/${username}/inventory/${subpath}/${collectionAddress}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      }

      controller.openProfileAt(path);
    },
    [connector, isConnected, isConnectDisabled, provider],
  );

  return handleListCallback;
}

export function useHandleUnlistCallback(): (
  collectionAddress: string,
  tokenIds: string[],
) => Promise<void> {
  const { connector } = useConnect();
  const { isConnected } = useAccount();
  const { onConnect, isConnectDisabled } = useConnectionViewModel();
  const { provider } = useArcade();

  const handleUnlistCallback = useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      if (!isConnected) {
        if (isConnectDisabled) {
          return;
        }
        await onConnect();
      }

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

      let path: string;

      if (tokenIds.length > 1) {
        tokenIds.forEach((tokenId) => {
          options.push(`tokenIds=${addAddressPadding(tokenId)}`);
        });
        path = `account/${username}/inventory/${subpath}/${collectionAddress}/unlist?${options.join("&")}`;
      } else {
        const [tokenId] = tokenIds;
        options.push("unlistView=true");
        path = `account/${username}/inventory/${subpath}/${collectionAddress}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      }

      controller.openProfileAt(path);
    },
    [connector, isConnected, isConnectDisabled, provider],
  );

  return handleUnlistCallback;
}

export function useHandleSendCallback(): (
  collectionAddress: string,
  tokenIds: string[],
) => Promise<void> {
  const { connector } = useConnect();
  const { isConnected } = useAccount();
  const { onConnect, isConnectDisabled } = useConnectionViewModel();
  const { provider } = useArcade();

  const handleSendCallback = useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      if (!isConnected) {
        if (isConnectDisabled) {
          return;
        }
        await onConnect();
      }

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

      let path: string;

      if (tokenIds.length > 1) {
        tokenIds.forEach((tokenId) => {
          options.push(`tokenIds=${addAddressPadding(tokenId)}`);
        });
        path = `account/${username}/inventory/${subpath}/${collectionAddress}/send?${options.join("&")}`;
      } else {
        const [tokenId] = tokenIds;
        options.push("sendView=true");
        path = `account/${username}/inventory/${subpath}/${collectionAddress}/token/${addAddressPadding(tokenId)}${options.length > 0 ? `?${options.join("&")}` : ""}`;
      }

      controller.openProfileAt(path);
    },
    [connector, isConnected, isConnectDisabled, provider],
  );

  return handleSendCallback;
}
