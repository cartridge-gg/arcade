import { createDojoConfig } from "@dojoengine/core";
import { constants } from "starknet";

import mainnet from "../../../../manifest_mainnet.json";

const MAINNET_RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet";
const SEPOLIA_RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const TORII_URL = "https://api.cartridge.gg/x/arcade-main/torii";

export const configs = {
  [constants.StarknetChainId.SN_SEPOLIA]: createDojoConfig({
    manifest: mainnet,
    toriiUrl: TORII_URL,
    rpcUrl: SEPOLIA_RPC_URL,
  }),
  [constants.StarknetChainId.SN_MAIN]: createDojoConfig({
    manifest: mainnet,
    toriiUrl: TORII_URL,
    rpcUrl: MAINNET_RPC_URL,
  }),
};
