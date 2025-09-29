import { Button } from "@cartridge/ui";
import { useAccount, useConnect } from "@starknet-react/core";
import { useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function Connect() {
  const { account, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const { trackEvent, events } = useAnalytics();

  const connectWallet = useCallback(async () => {
    trackEvent(events.AUTH_WALLET_CONNECT_CLICKED, {
      connector_type: connectors[0]?.id || "unknown",
    });

    try {
      connect({ connector: connectors[0] });
      trackEvent(events.AUTH_WALLET_CONNECTED, {
        connector_type: connectors[0]?.id || "unknown",
      });
    } catch (error) {
      trackEvent("auth_wallet_connect_failed", {
        error_message:
          error instanceof Error ? error.message : "Connection failed",
        connector_type: connectors[0]?.id || "unknown",
      });
    }
  }, [connect, connectors, trackEvent, events]);

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
