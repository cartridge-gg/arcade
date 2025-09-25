/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 * @param url - Optional RPC URL for the provider
 */
import { setupWorld } from "@cartridge/models";
import {
  BaseProvider,
  type BaseProviderOptions,
} from "@cartridge/internal";
import * as torii from "@dojoengine/torii-wasm";
import type { constants } from "starknet";

import { NAMESPACE } from "../constants";

const providerOptions: BaseProviderOptions = {
  namespace: NAMESPACE,
  torii: { ToriiClient: torii.ToriiClient },
};

export class MarketplaceProvider extends BaseProvider {
  public world: ReturnType<typeof setupWorld>;
  public marketplace: ReturnType<typeof setupWorld>["Marketplace"];

  /**
   * Create a new MarketplaceProvider instance
   *
   * @param chainId - The chain ID
   */
  constructor(chainId: constants.StarknetChainId) {
    super(chainId, providerOptions);

    this.world = setupWorld(this);
    this.marketplace = this.world.Marketplace;
  }
}
