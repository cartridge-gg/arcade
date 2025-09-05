import ControllerConnector from "@cartridge/connector/controller";
import { Button, GearIcon, SignOutIcon } from "@cartridge/ui";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect, useState, useMemo } from "react";
import { UserAvatar } from "../user/avatar";
import { Link, useNavigate } from "@tanstack/react-router";
import ControllerActions from "../modules/controller-actions";
import ControllerAction from "../modules/controller-action";
import { usePathBuilder } from "@/hooks/path-builder";
// New TanStack Query imports (commented out until fully integrated)
// import { useAccountNameQuery, useUserProfileQuery } from "@/queries/users";

export function User() {
  const { account, connector, address } = useAccount();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [name, setName] = useState<string>("");

  // New TanStack Query usage example (uncomment to use):
  /*
  // Query username from API instead of connector
  const { data: username } = useAccountNameQuery(address || '');
  const { data: userProfile } = useUserProfileQuery(address || '');
  
  // Use query data as fallback or primary source
  const displayName = name || username || userProfile?.username || '';
*/

  const navigate = useNavigate();
  const { buildPlayerPath } = usePathBuilder();

  const playerPath = useMemo(() => {
    if (!name && !address) return null;
    const playerName = !name ? address?.toLowerCase() : name.toLowerCase();
    return buildPlayerPath(playerName || "");
  }, [name, address, buildPlayerPath]);

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
    navigate({ to: "/", search: { filter: undefined } });
  }, [disconnect, navigate]);

  if (!isConnected || !account || !name) return null;

  return (
    <div className="flex items-center gap-3">
      {playerPath ? (
        <Link to={playerPath}>
          <Button
            variant="secondary"
            className="bg-background-100 hover:bg-background-150 px-3 py-2.5 select-none"
          >
            <div className="size-5 flex items-center justify-center">
              <UserAvatar username={name} size="sm" />
            </div>
            <p className="text-sm font-medium normal-case">{name}</p>
          </Button>
        </Link>
      ) : (
        <Button
          variant="secondary"
          className="bg-background-100 hover:bg-background-150 px-3 py-2.5 select-none"
          disabled
        >
          <div className="size-5 flex items-center justify-center">
            <UserAvatar username={name} size="sm" />
          </div>
          <p className="text-sm font-medium normal-case">{name}</p>
        </Button>
      )}
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
