import { DojoProvider } from "@dojoengine/core";
import type { ToriiClient } from "@dojoengine/torii-client";
import type {
  Account,
  AccountInterface,
  AllowArray,
  Call,
  constants,
  GetTransactionReceiptResponse,
} from "starknet";

import { configs } from "../configs";

type Constructor<TArgs extends any[] = any[], TInstance = object> = new (
  ...args: TArgs
) => TInstance;

type ToriiClientCtor = Constructor<
  [
    {
      toriiUrl: string;
      worldAddress: string;
    },
  ],
  ToriiClient
>;

export interface BaseProviderOptions {
  namespace: string;
  torii: {
    ToriiClient: ToriiClientCtor;
  };
}

interface InvokeContext {
  entrypoint?: string;
}

export class BaseProvider extends DojoProvider {
  protected readonly namespace: string;
  protected readonly toriiCtor: ToriiClientCtor;

  constructor(
    chainId: constants.StarknetChainId,
    { namespace, torii }: BaseProviderOptions,
  ) {
    const config = configs[chainId];

    if (!config) {
      throw new Error(`Missing config for chain ${chainId}`);
    }

    super(config.manifest, config.rpcUrl);

    this.manifest = config.manifest;
    this.namespace = namespace;
    this.toriiCtor = torii.ToriiClient;

    this.getWorldAddress = function () {
      return this.manifest.world.address;
    };
  }

  getToriiClient(toriiUrl: string): ToriiClient {
    return new this.toriiCtor({
      toriiUrl,
      worldAddress: this.manifest.world.address,
    });
  }

  protected onTransactionReverted(
    _receipt: GetTransactionReceiptResponse,
  ): void {}

  protected onInvokeCompleted(
    _receipt: GetTransactionReceiptResponse,
    _context?: InvokeContext,
  ): void {}

  async process(transactionHash: string): Promise<GetTransactionReceiptResponse> {
    let receipt: GetTransactionReceiptResponse;

    try {
      receipt = await this.provider.waitForTransaction(transactionHash, {
        retryInterval: 500,
      });
    } catch (error) {
      console.error(`Error waiting for transaction ${transactionHash}`);
      throw error;
    }

    if (receipt.isReverted()) {
      this.onTransactionReverted(receipt);
      throw new Error(
        `Transaction failed with reason: ${receipt.value.revert_reason}`,
      );
    }

    return receipt;
  }

  async invoke(
    signer: Account | AccountInterface,
    calls: AllowArray<Call>,
    context?: InvokeContext,
  ): Promise<GetTransactionReceiptResponse> {
    const tx = await this.execute(signer, calls, this.namespace);
    const receipt = await this.process(tx.transaction_hash);
    this.onInvokeCompleted(receipt, context);
    return receipt;
  }
}

export type { InvokeContext };
