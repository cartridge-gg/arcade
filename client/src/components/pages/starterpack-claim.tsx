import { Button } from "@cartridge/ui";
import { useClaimViewModel } from "@/features/starterpack/useClaimViewModel";
import { Loader2 } from "lucide-react";

export function StarterpackClaimPage() {
  const {
    isConnected,
    isLoading,
    handleConnectAndClaim,
  } = useClaimViewModel();

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Button
        onClick={handleConnectAndClaim}
        disabled={isLoading}
        className="h-12 text-lg font-semibold px-8"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {isConnected ? "Claiming..." : "Connecting..."}
          </>
        ) : (
          <>{isConnected ? "Claim" : "Connect & Claim"}</>
        )}
      </Button>
    </div>
  );
}
