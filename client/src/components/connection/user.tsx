import ControllerConnector from "@cartridge/connector/controller";
import { Button, SignOutIcon, Skeleton } from "@cartridge/ui";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect } from "react";
import { UserAvatar } from "../user/avatar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAnalytics } from "@/hooks/useAnalytics";

export function User() {
  const { account, connector } = useAccount();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { trackEvent, events } = useAnalytics();

  const { data: name, isLoading } = useQuery({
    queryKey: ["controller-username", account?.address],
    queryFn: async () => {
      try {
        const name = await (connector as ControllerConnector)?.username();
        return name || "";
      } catch (error) {
        console.error("Error fetching username:", error);
        return "";
      }
    },
    enabled: !!connector,
  });

  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    // Track profile button click
    trackEvent(events.PROFILE_BUTTON_CLICKED, {
      username: name,
      wallet_address: account?.address,
    });
    controller.openProfile();
  }, [connector, trackEvent, events, name, account?.address]);

  const handleDisconnect = useCallback(() => {
    // Track wallet disconnect
    trackEvent(events.AUTH_WALLET_DISCONNECTED, {
      wallet_address: account?.address,
      username: name,
    });
    disconnect();
    navigate("/");
  }, [disconnect, navigate, trackEvent, events, account?.address, name]);

  useEffect(() => {
    if (isLoading) {
      console.log("rendering isLoading");
    }

    if (!isConnected || !account || !name) {
      console.log("not connected or no account or no name");
    }

    console.log("rendering user component");
  }, [isLoading, isConnected, account, name]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    );
  }

  if (!isConnected || !account || !name) return null;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        className="bg-background-100 hover:bg-background-150 px-3 py-2.5 select-none"
        onClick={handleClick}
      >
        <div className="size-5 flex items-center justify-center">
          <UserAvatar username={name} size="sm" />
        </div>
        <p className="text-sm font-medium normal-case">{name}</p>
      </Button>
      <button
        onClick={handleDisconnect}
        className="p-2 rounded bg-background-100 hover:bg-background-150"
      >
        <SignOutIcon size="default" />
      </button>
    </div>
  );
}
