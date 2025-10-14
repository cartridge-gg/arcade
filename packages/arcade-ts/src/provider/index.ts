/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 * @param url - Optional RPC URL for the provider
 */
import type { DojoProvider } from "@dojoengine/core";
import * as torii from "@dojoengine/torii-client";
import type {
  Account,
  AccountInterface,
  AllowArray,
  Call,
  constants,
  GetTransactionReceiptResponse,
} from "starknet";

import { BaseProvider, type InvokeContext } from "./base";

import { NAMESPACE } from "../constants";
import { Social } from "./social";
import { Registry } from "./registry";
import { Slot } from "./slot";
import { TransactionType } from "./types";
import { setupWorld } from "../bindings";

export { TransactionType };

export class ArcadeProvider extends BaseProvider {
  public world: ReturnType<typeof setupWorld>;
  public social: Social;
  public registry: Registry;
  public slot: Slot;
  public marketplace: ReturnType<typeof setupWorld>["Marketplace"];

  /**
   * Create a new ArcadeProvider instance
   *
   * @param chainId - The chain ID
   */
  constructor(chainId: constants.StarknetChainId) {
    super(chainId, {
      namespace: NAMESPACE,
      torii: { ToriiClient: torii.ToriiClient },
    });

    const dojoProvider = this as unknown as DojoProvider;
    // The typed DojoProvider interface still expects the string index signature,
    // so cast to avoid the mismatch while we host the runtime instance.
    this.world = setupWorld(dojoProvider);
    this.marketplace = this.world.Marketplace;
    this.social = new Social(this.manifest);
    this.registry = new Registry(this.manifest);
    this.slot = new Slot(this.manifest);
  }

  /**
   * Execute a transaction and emit its result
   *
   * @param signer - Account that will sign the transaction
   * @param calls - Transaction call data
   * @param entrypoint - Starknet entrypoint invoked
   * @returns Transaction receipt
   */
  async invoke(
    signer: Account | AccountInterface,
    calls: AllowArray<Call>,
    context?: InvokeContext,
  ): Promise<GetTransactionReceiptResponse>;
  async invoke(
    signer: Account | AccountInterface,
    calls: AllowArray<Call>,
    entrypoint: string,
  ): Promise<GetTransactionReceiptResponse>;
  async invoke(
    signer: Account | AccountInterface,
    calls: AllowArray<Call>,
    contextOrEntrypoint?: InvokeContext | string,
  ): Promise<GetTransactionReceiptResponse> {
    const context =
      typeof contextOrEntrypoint === "string"
        ? { entrypoint: contextOrEntrypoint }
        : contextOrEntrypoint;

    return super.invoke(signer, calls, context);
  }
}
