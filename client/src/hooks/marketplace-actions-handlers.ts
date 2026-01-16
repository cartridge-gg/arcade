import { useCallback } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { DEFAULT_PRESET, DEFAULT_PROJECT } from "@/constants";
import { addAddressPadding } from "starknet";
import { useAnalytics } from "@/hooks/useAnalytics";
import type ControllerConnector from "@cartridge/connector/controller";
import { useConnectionViewModel } from "@/features/connection";
import { useTokenContracts } from "@/effect/hooks/tokens";
import { CollectionType } from "@/effect/atoms/tokens";
import type { OrderModel } from "@cartridge/arcade";
import { useUsername } from "@/hooks/username";

export type ActionHandlerParams = {
  project?: string;
  preset?: string;
};

export function useHandlePurchaseCallback(
  presetParams?: ActionHandlerParams,
): (
  collectionAddress: string,
  tokenIds: string[],
  orders: OrderModel[],
  preset?: string,
  project?: string,
) => Promise<void> {
  const { address } = useAccount();
  const { trackEvent, events } = useAnalytics();

  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();

  return useCallback(
    async (
      collectionAddress: string,
      tokenIds: string[],
      orders: OrderModel[],
    ) => {
      const eventType =
        orders.length > 1
          ? events.MARKETPLACE_BULK_PURCHASE_INITIATED
          : events.MARKETPLACE_PURCHASE_INITIATED;

      trackEvent(eventType, {
        purchase_type: orders.length > 1 ? "bulk" : "single",
        items_count: orders.length,
        order_ids: orders.map((order) => order.id.toString()),
        collection_address: collectionAddress,
        buyer_address: address,
        item_token_ids: tokenIds,
      });

      const path = pathBuilder({
        viewType: "purchase",
        collectionAddress,
        tokenIds,
        orders,
      });
      return openController(path);
    },
    [pathBuilder, openController, trackEvent, events],
  );
}

export function useHandlePurchaseViewCallback(
  presetParams?: ActionHandlerParams,
): (
  collectionAddress: string,
  tokenIds: string[],
  orders: OrderModel[],
) => Promise<void> {
  const { address } = useAccount();
  const { trackEvent, events } = useAnalytics();

  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();

  return useCallback(
    async (
      collectionAddress: string,
      tokenIds: string[],
      orders: OrderModel[],
    ) => {
      trackEvent(events.MARKETPLACE_PURCHASE_INITIATED, {
        purchase_type: "single",
        items_count: 1,
        order_ids: [orders[0].id.toString()],
        collection_address: collectionAddress,
        buyer_address: address,
        item_token_ids: [tokenIds[0]],
      });

      const path = pathBuilder({
        viewType: "purchaseView",
        collectionAddress,
        tokenIds,
        orders,
      });
      return openController(path);
    },
    [pathBuilder, openController, trackEvent, events],
  );
}

export function useHandleListCallback(
  presetParams?: ActionHandlerParams,
): (collectionAddress: string, tokenIds: string[]) => Promise<void> {
  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();
  return useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      const path = pathBuilder({
        viewType: "list",
        collectionAddress,
        tokenIds,
      });
      return openController(path);
    },
    [pathBuilder, openController],
  );
}

export function useHandleListViewCallback(
  presetParams?: ActionHandlerParams,
): (collectionAddress: string, tokenIds: string[]) => Promise<void> {
  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();
  return useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      const path = pathBuilder({
        viewType: "listView",
        collectionAddress,
        tokenIds,
      });
      return openController(path);
    },
    [pathBuilder, openController],
  );
}

export function useHandleUnlistCallback(
  presetParams?: ActionHandlerParams,
): (collectionAddress: string, tokenIds: string[]) => Promise<void> {
  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();
  return useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      const path = pathBuilder({
        // viewType: "unlist", // TODO: /unlist is not implemented in the controller
        viewType: "unlistView",
        collectionAddress,
        tokenIds,
      });
      return openController(path);
    },
    [pathBuilder, openController],
  );
}

export function useHandleUnlistViewCallback(
  presetParams?: ActionHandlerParams,
): (collectionAddress: string, tokenIds: string[]) => Promise<void> {
  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();
  return useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      const path = pathBuilder({
        viewType: "unlistView",
        collectionAddress,
        tokenIds,
      });
      return openController(path);
    },
    [pathBuilder, openController],
  );
}

export function useHandleSendCallback(
  presetParams?: ActionHandlerParams,
): (collectionAddress: string, tokenIds: string[]) => Promise<void> {
  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();
  return useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      const path = pathBuilder({
        viewType: "send",
        collectionAddress,
        tokenIds,
      });
      return openController(path);
    },
    [pathBuilder, openController],
  );
}

export function useHandleSendViewCallback(
  presetParams?: ActionHandlerParams,
): (collectionAddress: string, tokenIds: string[]) => Promise<void> {
  const pathBuilder = useControllerPathBuilder(presetParams);
  const openController = useOpenControllerAtPathCallback();
  return useCallback(
    async (collectionAddress: string, tokenIds: string[]) => {
      const path = pathBuilder({
        viewType: "sendView",
        collectionAddress,
        tokenIds,
      });
      return openController(path);
    },
    [pathBuilder, openController],
  );
}

type ControllerViewType =
  | "purchaseView"
  | "listView"
  | "unlistView"
  | "sendView"
  | "purchase"
  | "list"
  | "unlist"
  | "send";

type MakeControllerViewPathParams = {
  viewType: ControllerViewType;
  collectionAddress: string;
  tokenIds: string[];
  orders?: OrderModel[];
};

function useControllerPathBuilder(
  presetParams?: ActionHandlerParams,
): (params: MakeControllerViewPathParams) => string | undefined {
  const { trackEvent, events } = useAnalytics();

  const username = useUsername();

  const collections = useTokenContracts();

  const callback = useCallback(
    ({
      viewType,
      collectionAddress,
      tokenIds,
      orders,
    }: MakeControllerViewPathParams) => {
      if (!username) return undefined;
      if (!collectionAddress) return undefined;
      if (tokenIds.length === 0) return undefined;

      const collection = collections.data?.find(
        (collection) => collection.contract_address === collectionAddress,
      );
      const isERC1155 = collection
        ? collection.contract_type === CollectionType.ERC1155
        : undefined;
      const subpath = isERC1155 ? "collectible" : "collection";

      const options = [
        // `ps=${presetParams?.project ?? DEFAULT_PROJECT}`, // breaks jokers of neon
        `ps=${DEFAULT_PROJECT}`,
        `preset=${presetParams?.preset || DEFAULT_PRESET || "cartridge"}`,
      ];

      if (viewType.endsWith("View")) {
        options.push(`${viewType}=true`);

        if (viewType === "purchaseView") {
          if (!orders?.length) {
            trackEvent(events.MARKETPLACE_PURCHASE_FAILED, {
              error_message: "Missing orders for purchase",
              purchase_type: tokenIds.length > 1 ? "bulk" : "single",
            });
            return undefined;
          }
          options.push(`address=${orders[0].owner}`);
        }

        const tokenId = addAddressPadding(tokenIds[0]);

        return `account/${username}/inventory/${subpath}/${collectionAddress}/token/${tokenId}?${options.join("&")}`;
      }

      if (viewType === "purchase") {
        if (!orders?.length) {
          trackEvent(events.MARKETPLACE_PURCHASE_FAILED, {
            error_message: "Missing orders for purchase",
            purchase_type: tokenIds.length > 1 ? "bulk" : "single",
          });
          return undefined;
        }
        options.push(
          `orders=${orders.map((order) => order.id.toString()).join(",")}`,
        );
      } else {
        tokenIds.forEach((tokenId) => {
          options.push(`tokenIds=${addAddressPadding(tokenId)}`);
        });
      }

      return `account/${username}/inventory/${subpath}/${collectionAddress}/${viewType}?${options.join("&")}`;
    },
    [username, collections?.status, trackEvent, events, presetParams],
  );

  return callback;
}

export function useOpenControllerAtPathCallback(): (
  path: string | undefined,
) => Promise<void> {
  const { connector } = useConnect();
  const { isConnected } = useAccount();
  const { onConnect, isConnectDisabled } = useConnectionViewModel();

  const callback = useCallback(
    async (path: string | undefined) => {
      if (!path) return;

      if (!isConnected) {
        if (isConnectDisabled) {
          return;
        }
        await onConnect();
      }

      const controller = (connector as ControllerConnector)?.controller;
      if (!controller) {
        console.error("Connector not initialized");
        return;
      }

      controller.openProfileAt(path);
    },
    [connector, isConnected, isConnectDisabled],
  );

  return callback;
}
