import { Button } from "@cartridge/ui-next";
import { useAccount, useConnect } from "@starknet-react/core";
import { useCallback } from "react";

export function Connect() {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const connectWallet = useCallback(async () => {
    connect({ connector: connectors[0] });
  }, [connect, connectors]);

  if (isConnected || !!account) return null;

  return (
    <Button onClick={connectWallet}>
      <p className="text-sm font-semibold px-1">Connect</p>
    </Button>
  );
}
