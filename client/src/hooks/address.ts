import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { getChecksumAddress } from "starknet";
import { useArcade } from "./arcade";

export function useAddress() {
  const { isConnected, address: self } = useAccount();
  const { player } = useArcade();

  const address = useMemo(() => {
    return getChecksumAddress(player || self || "0x0");
  }, [player, self]);

  const isSelf = useMemo(() => {
    return isConnected && address === getChecksumAddress(self || "0x1");
  }, [address, self, isConnected]);

  const isZero = useMemo(() => {
    const address = getChecksumAddress(player || "0x0");
    return BigInt(address) === 0n;
  }, [player]);

  return {
    self,
    address,
    isSelf,
    isZero,
  };
}
