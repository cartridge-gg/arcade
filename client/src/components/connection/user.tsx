import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui-next";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { UserAvatar } from "../user/avatar";
import { useNavigate } from "react-router-dom";

export function User() {
  const { account, connector, address } = useAccount();
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

  const navigate = useNavigate();
  const handleClick = useCallback(
    (address: string | undefined) => {
      if (!address) return;
      const url = new URL(window.location.href);
      url.searchParams.set("address", address);
      url.searchParams.set("playerTab", "inventory");
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  if (!isConnected || !account || !name) return null;

  return (
    <Button
      variant="secondary"
      className="px-3 py-2.5"
      onClick={() => handleClick(address)}
    >
      <div className="h-5 w-5 flex items-center justify-center">
        <UserAvatar username={name} size="lg" />
      </div>
      <p className="text-sm font-semibold normal-case">{name}</p>
    </Button>
  );
}
