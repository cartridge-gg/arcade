import { useTheme } from "@/hooks/context";
import { Button } from "@cartridge/ui";
import { useAccount, useConnect } from "@starknet-react/core";
import { useCallback } from "react";

export function Connect() {
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { theme } = useTheme();
  const { isConnected } = useAccount();
  const connectWallet = useCallback(async () => {
    connect({ connector: connectors[0] });
  }, [connect, connectors]);

  if (isConnected || !!account) return null;

  const glowStyle = {
    boxShadow: `0 0 8px ${theme.colors?.primary || "#fbcb4a"}80`,
  };

  return (
    <Button
      variant="secondary"
      className="border border-primary-100 text-primary bg-background-100 hover:background-150 transition-colors text-sm font-medium"
      onClick={connectWallet}
      style={glowStyle}
    >
      Connect
    </Button>
  );
}
