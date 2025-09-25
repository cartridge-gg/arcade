/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 * @param url - Optional RPC URL for the provider
 */
import { DojoProvider } from "@dojoengine/core";
import * as torii from "@dojoengine/torii-client";
import EventEmitter from "eventemitter3";
import { Account, AccountInterface, AllowArray, Call, constants, GetTransactionReceiptResponse } from "starknet";
import { NAMESPACE } from "../constants";
import { TransactionType } from "./types";
import { Social } from "./social";
import { Registry } from "./registry";
import { Slot } from "./slot";
import { configs } from "../configs";
export { TransactionType };

function ApplyEventEmitter<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    eventEmitter = new EventEmitter();

    /**
     * Emit an event
     * @param event - The event name
     * @param args - Arguments to pass to event handlers
     */
    emit(event: string, ...args: any[]) {
      this.eventEmitter.emit(event, ...args);
    }

    /**
     * Subscribe to an event
     * @param event - The event name to listen for
     * @param listener - Callback function when event occurs
     */
    on(event: string, listener: (...args: any[]) => void) {
      this.eventEmitter.on(event, listener);
    }

    /**
     * Unsubscribe from an event
     * @param event - The event name to stop listening to
     * @param listener - The callback function to remove
     */
    off(event: string, listener: (...args: any[]) => void) {
      this.eventEmitter.off(event, listener);
    }
  };
}
export const DojoEmitterProvider = ApplyEventEmitter(DojoProvider);

export class ArcadeProvider extends DojoEmitterProvider {
  public social: Social;
  public registry: Registry;
  public slot: Slot;

  /**
   * Create a new ArcadeProvider instance
   *
   * @param chainId - The chain ID
   */
  constructor(chainId: constants.StarknetChainId) {
    const config = configs[chainId];
    super(config.manifest, config.rpcUrl);
    this.manifest = config.manifest;

    this.getWorldAddress = function () {
      const worldAddress = this.manifest.world.address;
      return worldAddress;
    };

    this.social = new Social(config.manifest);
    this.registry = new Registry(config.manifest);
    this.slot = new Slot(config.manifest);
  }

  /**
   * Get a Torii client
   * @param toriiUrl - The URL of the Torii client
   * @returns A Torii client
   */
  getToriiClient(toriiUrl: string): torii.ToriiClient {
    const toriiClient = new torii.ToriiClient({
      toriiUrl: toriiUrl,
      worldAddress: this.manifest.world.address,
    });
    return toriiClient;
  }

  /**
   * Wait for a transaction to complete and check for errors
   *
   * @param transactionHash - Hash of transaction to wait for
   * @returns Transaction receipt
   * @throws Error if transaction fails or is reverted
   */
  async process(transactionHash: string): Promise<GetTransactionReceiptResponse> {
    let receipt;
    try {
      receipt = await this.provider.waitForTransaction(transactionHash, {
        retryInterval: 500,
      });
    } catch (error) {
      console.error(`Error waiting for transaction ${transactionHash}`);
      throw error;
    }
    // Check if the transaction was reverted and throw an error if it was
    if (receipt.isReverted()) {
      this.emit("FAILED", `Transaction failed with reason: ${receipt.value.revert_reason}`);
      throw new Error(`Transaction failed with reason: ${receipt.value.revert_reason}`);
    }
    return receipt;
  }

  /**
   * Execute a transaction and emit its result
   *
   * @param signer - Account that will sign the transaction
   * @param transactionDetails - Transaction call data
   * @returns Transaction receipt
   */
  async invoke(
    signer: Account | AccountInterface,
    calls: AllowArray<Call>,
    entrypoint: string,
  ): Promise<GetTransactionReceiptResponse> {
    const tx = await this.execute(signer, calls, NAMESPACE);
    const receipt = await this.process(tx.transaction_hash);
    this.emit("COMPLETED", {
      details: receipt,
      type: TransactionType[entrypoint.toUpperCase() as keyof typeof TransactionType],
    });
    return receipt;
  }
}
