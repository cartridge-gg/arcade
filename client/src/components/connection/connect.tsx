import { Button } from "@cartridge/ui";
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
    <Button
      variant="secondary"
      className="border border-primary-100 text-primary hover:text-spacer bg-background-100 hover:bg-primary transition-colors text-sm font-medium select-none px-4 py-2.5"
      onClick={connectWallet}
    >
      <span className="font-medium text-sm">Connect</span>
    </Button>
  );
}
