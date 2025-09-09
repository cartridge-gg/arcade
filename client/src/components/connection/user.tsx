import ControllerConnector from "@cartridge/connector/controller";
import { Button, GearIcon, SignOutIcon } from "@cartridge/ui";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { UserAvatar } from "../user/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import ControllerActions from "../modules/controller-actions";
import ControllerAction from "../modules/controller-action";
import { joinPaths } from "@/helpers";

export function User() {
  const { account, connector, address } = useAccount();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [name, setName] = useState<string>("");

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
  }, [name, address, navigate]);

  useEffect(() => {
    async function fetch() {
      try {
        const name = await (connector as ControllerConnector)?.username();
        if (!name) return;
        setName(name);
      } catch (error) {
        console.error(error);
      }
    }
    fetch();
  }, [connector]);

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
