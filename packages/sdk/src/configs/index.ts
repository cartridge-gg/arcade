import { createDojoConfig } from "@dojoengine/core";

import sepolia from "../../../../contracts/manifest_sepolia.json";
import mainnet from "../../../../contracts/manifest_mainnet.json";

import { constants } from "starknet";

const MAINNET_RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet";
const SEPOLIA_RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const TORII_URL = "https://api.cartridge.gg/x/arcade/torii";

export const configs = {
  [constants.StarknetChainId.SN_SEPOLIA]: createDojoConfig({
    manifest: sepolia,
    toriiUrl: TORII_URL,
    rpcUrl: SEPOLIA_RPC_URL,
  }),
  [constants.StarknetChainId.SN_MAIN]: createDojoConfig({
    manifest: mainnet,
    toriiUrl: TORII_URL,
    rpcUrl: MAINNET_RPC_URL,
  }),
};
