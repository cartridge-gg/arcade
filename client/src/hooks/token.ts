import { useERC20Balance } from "@cartridge/utils";
import { useAccount } from "@starknet-react/core";
import { useConnection } from "./context";
import { getChecksumAddress } from "starknet";

export function useTokens(accountAddress?: string, tokens?: string[]) {
  const { erc20: options, provider, isVisible } = useConnection();
  const { address } = useAccount();
  return useERC20Balance({
    address: accountAddress ?? address,
    contractAddress: [...options, ...(tokens ?? [])],
    provider: provider as any, // Type assertion to bypass type mismatch
    interval: isVisible ? 3000 : undefined,
  });
}

export function useToken({
  tokenAddress,
  accountAddress,
}: {
  accountAddress?: string;
  tokenAddress: string;
}) {
  const { data } = useTokens(accountAddress);
  return data.find(
    (t) =>
      getChecksumAddress(t.meta.address) === getChecksumAddress(tokenAddress),
  );
}
