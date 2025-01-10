import { createDojoConfig } from "@dojoengine/core";

import manifest from "../../../../contracts/manifest_slot.json";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const TORII_URL = "https://api.cartridge.gg/x/arcade/torii";

export const config = createDojoConfig({
  manifest,
  toriiUrl: TORII_URL,
  rpcUrl: RPC_URL,
});
