import { useState, useCallback, useMemo } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { useParams } from "@tanstack/react-router";
import { useReferralAttribution } from "@/hooks/useReferralAttribution";

/**
 * Mock starterpack data structure
 * TODO: Replace with actual data from contract in Phase 2
 */
interface StarterpackData {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  price: string;
  paymentToken: string;
}

interface ClaimState {
  isLoading: boolean;
  error: string | null;
  txHash?: string;
  isSuccess: boolean;
}

/**
 * View model hook for starterpack claiming page
 *
 * Manages:
 * - Starterpack data fetching (mocked for now)
 * - Wallet connection
 * - Claim transaction flow
 * - Referral attribution integration
 */
export function useClaimViewModel() {
  const { starterpackId } = useParams({ from: "/starterpack/$starterpackId" });
  const { account, isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const attribution = useReferralAttribution();

  const [claimState, setClaimState] = useState<ClaimState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  // Mock starterpack data
  // TODO: Phase 2 - Replace with actual contract query
  const starterpack = useMemo((): StarterpackData | null => {
    if (!starterpackId) return null;

    return {
      id: starterpackId,
      name: `Starterpack #${starterpackId}`,
      description:
        "Get started with exclusive items, resources, and bonuses to jumpstart your adventure!",
      imageUri: "https://via.placeholder.com/400x400?text=Starterpack",
      price: "0.01",
      paymentToken: "ETH",
    };
  }, [starterpackId]);

  /**
   * Handle wallet connection
   */
  const handleConnect = useCallback(async () => {
    try {
      setClaimState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use the first available connector (typically Controller)
      const connector = connectors[0];
      if (!connector) {
        throw new Error("No connector available");
      }

      await connect({ connector });

      setClaimState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Connection error:", error);
      setClaimState({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
        isSuccess: false,
      });
    }
  }, [connect, connectors]);

  /**
   * Handle starterpack claim
   * TODO: Phase 2 - Implement actual contract call
   */
  const handleClaim = useCallback(async () => {
    if (!account || !starterpackId) {
      console.error("Missing account or starterpack ID");
      return;
    }

    try {
      setClaimState({ isLoading: true, error: null, isSuccess: false });

      // TODO: Phase 2 - Replace with actual contract call
      // const { provider } = useArcade();
      // const calls = provider.starterpack.issue({
      //   starterpackId: Number(starterpackId),
      //   recipient: address,
      //   referrer: attribution.referrer,
      //   referrerGroup: attribution.referrerGroup
      // });
      // const result = await account.execute(calls);

      // Mock transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Claim transaction:", {
        starterpackId,
        recipient: address,
        referrer: attribution.referrer,
        referrerGroup: attribution.referrerGroup,
      });

      setClaimState({
        isLoading: false,
        error: null,
        txHash: "0xmock_transaction_hash",
        isSuccess: true,
      });
    } catch (error) {
      console.error("Claim error:", error);
      setClaimState({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to claim starterpack",
        isSuccess: false,
      });
    }
  }, [account, starterpackId, address, attribution]);

  /**
   * Combined connect & claim action
   */
  const handleConnectAndClaim = useCallback(async () => {
    if (!isConnected) {
      await handleConnect();
      // After connection, user needs to click claim again
      // This prevents auto-claiming immediately after connection
      return;
    }

    await handleClaim();
  }, [isConnected, handleConnect, handleClaim]);

  return {
    // Data
    starterpackId,
    starterpack,
    attribution: attribution.attribution,

    // Connection state
    isConnected,
    address,

    // Claim state
    isLoading: claimState.isLoading,
    error: claimState.error,
    txHash: claimState.txHash,
    isSuccess: claimState.isSuccess,

    // Actions
    handleConnect,
    handleClaim,
    handleConnectAndClaim,
  };
}
