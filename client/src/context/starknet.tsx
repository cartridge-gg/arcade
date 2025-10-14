import { type Chain, mainnet, sepolia } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { type PropsWithChildren, useMemo } from "react";
import { constants } from "starknet";
import ControllerConnector from "@cartridge/connector/controller";
import { getSocialPolicies, getRegistryPolicies } from "@cartridge/arcade";
import { getMarketplacePolicies } from "@cartridge/arcade";

const chainId = constants.StarknetChainId.SN_MAIN;

const controller = new ControllerConnector({
  defaultChainId: chainId,
  chains: [
    {
      rpcUrl:
        import.meta.env.VITE_RPC_URL ||
        "https://api.cartridge.gg/x/starknet/mainnet",
    },
  ],
  policies: {
    contracts: {
      ...getSocialPolicies(chainId).contracts,
      ...getRegistryPolicies(chainId).contracts,
      ...getMarketplacePolicies(chainId).contracts,
    },
  },
});

export function StarknetProvider({ children }: PropsWithChildren) {
  const jsonProvider = useMemo(() => {
    return jsonRpcProvider({
      rpc: (chain: Chain) => {
        switch (chain) {
          case mainnet:
            return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
          case sepolia:
            return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
          default:
            return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
        }
      },
    });
  }, []);

  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet]}
      connectors={[controller]}
      explorer={voyager}
      provider={jsonProvider}
    >
      {children}
    </StarknetConfig>
  );
}
