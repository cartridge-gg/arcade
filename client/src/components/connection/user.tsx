import ControllerConnector from "@cartridge/connector/controller";
import { Button, GearIcon, SignOutIcon, Skeleton } from "@cartridge/ui";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect } from "react";
import { UserAvatar } from "../user/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import ControllerActions from "../modules/controller-actions";
import ControllerAction from "../modules/controller-action";
import { joinPaths } from "@/helpers";
import { useQuery } from "@tanstack/react-query";

export function User() {
  const { account, connector, address } = useAccount();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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

  const location = useLocation();
  const navigate = useNavigate();
  const handleClick = useCallback(() => {
    if (!name && !address) return;
    // Update the url params
    let pathname = location.pathname;
    const playerName = `${!name ? address?.toLowerCase() : name.toLowerCase()}`;
    pathname = pathname.replace(/\/collection\/[^/]+/, "");
    pathname = pathname.replace(/\/player\/[^/]+/, "");
    pathname = pathname.replace(/\/tab\/[^/]+/, "");
    pathname = pathname.replace(/\/edition\/[^/]+/, "");
    pathname = joinPaths(pathname, `/player/${playerName}`);
    navigate(pathname);
  }, [address, navigate]);

  const handleSettings = useCallback(async () => {
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    controller.openSettings();
  }, [connector]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    navigate("/");
  }, [disconnect, navigate]);

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
        onClick={() => handleClick()}
      >
        <div className="size-5 flex items-center justify-center">
          <UserAvatar username={name} size="sm" />
        </div>
        <p className="text-sm font-medium normal-case">{name}</p>
      </Button>
      <ControllerActions>
        <ControllerAction
          label="Settings"
          Icon={<GearIcon size="sm" />}
          onClick={handleSettings}
        />
        <ControllerAction
          label="Disconnect"
          Icon={<SignOutIcon size="sm" />}
          onClick={handleDisconnect}
        />
      </ControllerActions>
    </div>
  );
}
