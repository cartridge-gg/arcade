import ControllerConnector from "@cartridge/connector/controller";
import { CopyAddress, SpaceInvaderIcon } from "@cartridge/ui-next";
import { useAccount } from "@starknet-react/core";
import { useEffect, useState } from "react";

export function User() {
  const { account, connector } = useAccount();
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

  return (
    <div
      className="h-16 flex gap-2 sticky top-16 bg-background justify-between items-center select-none"
      draggable={false}
    >
      <div className="flex min-w-0 gap-4 items-center">
        <div className="w-16 h-16 bg-secondary flex shrink-0 items-center justify-center overflow-hidden rounded">
          <SpaceInvaderIcon size="xl" variant="solid" />
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="text-lg font-semibold truncate h-6 flex items-center">
            {name}
          </div>
          <CopyAddress address={account?.address ?? ""} size="xs" />
        </div>
      </div>
    </div>
  );
}
