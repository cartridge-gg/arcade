import { constants } from "starknet";
import ControllerConnector from "@cartridge/connector/controller";
import {
  KeychainOptions,
  ProfileOptions,
  ProviderOptions,
} from "@cartridge/controller";
import { getSocialPolicies, getRegistryPolicies } from "@bal7hazar/arcade-sdk";

const chainId = constants.StarknetChainId.SN_SEPOLIA;

const provider: ProviderOptions = {
  defaultChainId: chainId,
  chains: [{ rpcUrl: import.meta.env.VITE_RPC_SEPOLIA }],
};

const keychain: KeychainOptions = {
  policies: {
    contracts: {
      ...getSocialPolicies(chainId).contracts,
      ...getRegistryPolicies(chainId).contracts,
    },
  },
};

const profile: ProfileOptions = {
  slot: "ryomainnet",
  namespace: "dopewars",
  tokens: {
    erc20: [
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    ],
  },
};

export const controller = new ControllerConnector({
  ...provider,
  ...keychain,
  ...profile,
});
