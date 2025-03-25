import { useArcade } from "@/hooks/arcade";
import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { PropsWithChildren, useMemo, useRef } from "react";
import { constants } from "starknet";
import ControllerConnector from "@cartridge/connector/controller";
import {
  KeychainOptions,
  ProfileOptions,
  ProviderOptions,
} from "@cartridge/controller";
import { getSocialPolicies, getRegistryPolicies } from "@bal7hazar/arcade-sdk";
import { ERC20_ADDRESSES } from "@/constants";

const chainId = constants.StarknetChainId.SN_MAIN;

const keychain: KeychainOptions = {
  policies: {
    contracts: {
      ...getSocialPolicies(chainId).contracts,
      ...getRegistryPolicies(chainId).contracts,
    },
  },
};

const profile: ProfileOptions = {
  preset: "cartridge",
  slot: "arcadebal",
  tokens: {
    erc20: ERC20_ADDRESSES,
  },
};

export function StarknetProvider({ children }: PropsWithChildren) {
  const { chains } = useArcade();
  const initialized = useRef<boolean>(false);

  const jsonProvider = useMemo(() => {
    return jsonRpcProvider({
      rpc: (chain: Chain) => {
        switch (chain) {
          case mainnet:
            return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
          case sepolia:
            return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
          default:
            const found = chains.find((c) => c.id === chain.id);
            if (!found) {
              throw new Error(`Chain ${chain.id} not found`);
            }
            return { nodeUrl: found.rpcUrls.default.http[0] };
        }
      },
    });
  }, [chains]);

  const provider: ProviderOptions | null = useMemo(() => {
    if (!chains.length) return null;
    return {
      defaultChainId: chainId,
      chains: chains.map((chain) => ({ rpcUrl: chain.rpcUrls.public.http[0] })),
    };
  }, [chains]);

  const controller = useMemo(() => {
    if (initialized.current || !provider) return null;
    initialized.current = true;
    return new ControllerConnector({
      ...provider,
      ...keychain,
      ...profile,
    });
  }, [initialized, provider]);

  if (!chains.length || !controller) return null;

  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet, sepolia]}
      connectors={[controller]}
      explorer={voyager}
      provider={jsonProvider}
    >
      {children}
    </StarknetConfig>
  );
}
