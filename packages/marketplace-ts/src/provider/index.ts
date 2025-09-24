/**
 * Provider class for interacting with the Cartridge World contracts
 *
 * @param manifest - The manifest containing contract addresses and ABIs
 * @param url - Optional RPC URL for the provider
 */
import { setupWorld } from "@cartridge/models";
import { DojoProvider } from "@dojoengine/core";
import * as torii from "@dojoengine/torii-wasm";
import type {
	Account,
	AccountInterface,
	AllowArray,
	Call,
	constants,
	GetTransactionReceiptResponse,
} from "starknet";
import { NAMESPACE } from "../constants";
import { configs } from "../configs";

export class MarketplaceProvider extends DojoProvider {
	public world: ReturnType<typeof setupWorld>;
	public marketplace: ReturnType<typeof setupWorld>["Marketplace"];

	/**
	 * Create a new MarketplaceProvider instance
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

		this.world = setupWorld(this);
		this.marketplace = this.world.Marketplace;
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
	async process(
		transactionHash: string,
	): Promise<GetTransactionReceiptResponse> {
		let receipt: GetTransactionReceiptResponse;
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
			throw new Error(
				`Transaction failed with reason: ${receipt.value.revert_reason}`,
			);
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
	async invoke(signer: Account | AccountInterface, calls: AllowArray<Call>) {
		const tx = await this.execute(signer, calls, NAMESPACE);
		const receipt = await this.process(tx.transaction_hash);
		return receipt;
	}
}
