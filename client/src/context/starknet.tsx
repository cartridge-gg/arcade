import { controller } from "@/connectors";
import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { PropsWithChildren } from "react";

export function StarknetProvider({ children }: PropsWithChildren) {
  const provider = jsonRpcProvider({
    rpc: (chain: Chain) => {
      switch (chain) {
        case mainnet:
          return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
        case sepolia:
        default:
          return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
      }
    },
  });

  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet, sepolia]}
      connectors={[controller]}
      explorer={voyager}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}
