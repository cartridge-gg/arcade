import { useCallback } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import type ControllerConnector from "@cartridge/connector/controller";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface ConnectionViewModel {
  status: "loading" | "connected" | "disconnected";
  username: string;
  onConnect: () => Promise<void>;
  onOpenProfile: () => void;
  onDisconnect: () => void;
  isConnectDisabled: boolean;
  isFetchingUsername: boolean;
}

export function useConnectionViewModel(): ConnectionViewModel {
  const { account, connector, isConnected } = useAccount();
  const { connect, connectors, status: connectStatus } = useConnect();
  const isConnecting = connectStatus === "pending";
  const { disconnect } = useDisconnect();
  const { trackEvent, events } = useAnalytics();

  const { data: username = "", isLoading: isFetchingUsername } = useQuery({
    queryKey: ["controller-username", account?.address],
    queryFn: async () => {
      const controller = (connector as ControllerConnector | undefined)
        ?.controller;
      if (!controller) return "";
      try {
        const fetched = await (connector as ControllerConnector).username();
        return fetched || "";
      } catch (error) {
        console.error("Error fetching username:", error);
        return "";
      }
    },
    enabled: !!connector && !!account,
  });

  const onConnect = useCallback(async () => {
    const primaryConnector = connectors[0];
    trackEvent(events.AUTH_WALLET_CONNECT_CLICKED, {
      connector_type: primaryConnector?.id || "unknown",
    });

    try {
      await connect({ connector: primaryConnector });
      trackEvent(events.AUTH_WALLET_CONNECTED, {
        connector_type: primaryConnector?.id || "unknown",
      });
    } catch (error) {
      trackEvent("auth_wallet_connect_failed", {
        error_message:
          error instanceof Error ? error.message : "Connection failed",
        connector_type: primaryConnector?.id || "unknown",
      });
    }
  }, [connect, connectors, trackEvent, events]);

  const onOpenProfile = useCallback(() => {
    const controller = (connector as ControllerConnector | undefined)
      ?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }

    trackEvent(events.PROFILE_BUTTON_CLICKED, {
      username,
      wallet_address: account?.address,
    });

    controller.openProfile();
  }, [connector, trackEvent, events, username, account?.address]);

  const onDisconnect = useCallback(() => {
    trackEvent(events.AUTH_WALLET_DISCONNECTED, {
      wallet_address: account?.address,
      username,
    });
    disconnect();
  }, [
    disconnect,
    account?.address,
    username,
    trackEvent,
    events.AUTH_WALLET_DISCONNECTED,
  ]);

  const status: ConnectionViewModel["status"] =
    !isConnected || !account
      ? "disconnected"
      : isFetchingUsername
        ? "loading"
        : "connected";

  return {
    status,
    username,
    onConnect,
    onOpenProfile,
    onDisconnect,
    isConnectDisabled: isConnecting,
    isFetchingUsername,
  };
}
