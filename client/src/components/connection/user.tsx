import ControllerConnector from "@cartridge/connector/controller";
import { Button, SpaceInvaderIcon } from "@cartridge/ui-next";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";

export function User() {
  const { account, connector } = useAccount();
  const { isConnected } = useAccount();
  const [name, setName] = useState<string>("");

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

  const handleClick = useCallback(async () => {
    const controller = (connector as ControllerConnector)?.controller;
    if (!controller) {
      console.error("Connector not initialized");
      return;
    }
    controller.openProfile("inventory");
  }, [connector]);

  if (!isConnected || !account || !name) return null;

  return (
    <Button variant="secondary" onClick={handleClick}>
      <div className="h-7 w-7 flex items-center justify-center">
        <SpaceInvaderIcon className="h-4 w-4" size="lg" variant="solid" />
      </div>
      <p className="text-sm font-semibold normal-case">{name}</p>
    </Button>
  );
}
