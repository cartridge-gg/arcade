import type { DojoProvider, DojoCall } from "@dojoengine/core";
import type { Account, AccountInterface, BigNumberish } from "starknet";

export function setupWorld(provider: DojoProvider) {
	const build_Marketplace_cancel_calldata = (
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "cancel",
			calldata: [orderId, collection, tokenId],
		};
	};

	const Marketplace_cancel = async (
		snAccount: Account | AccountInterface,
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_cancel_calldata(orderId, collection, tokenId),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_execute_calldata = (
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
		assetId: BigNumberish,
		quantity: BigNumberish,
		royalties: boolean,
		clientFee: BigNumberish,
		clientReceiver: string,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "execute",
			calldata: [
				orderId,
				collection,
				tokenId,
				assetId,
				quantity,
				royalties,
				clientFee,
				clientReceiver,
			],
		};
	};

	const Marketplace_execute = async (
		snAccount: Account | AccountInterface,
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
		assetId: BigNumberish,
		quantity: BigNumberish,
		royalties: boolean,
		clientFee: BigNumberish,
		clientReceiver: string,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_execute_calldata(
					orderId,
					collection,
					tokenId,
					assetId,
					quantity,
					royalties,
					clientFee,
					clientReceiver,
				),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_getValidities_calldata = (
		orders: Array<[BigNumberish, string, BigNumberish]>,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "get_validities",
			calldata: [orders],
		};
	};

	const Marketplace_getValidities = async (
		orders: Array<[BigNumberish, string, BigNumberish]>,
	) => {
		try {
			return await provider.call(
				"MARKETPLACE",
				build_Marketplace_getValidities_calldata(orders),
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_getValidity_calldata = (
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "get_validity",
			calldata: [orderId, collection, tokenId],
		};
	};

	const Marketplace_getValidity = async (
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
	) => {
		try {
			return await provider.call(
				"MARKETPLACE",
				build_Marketplace_getValidity_calldata(orderId, collection, tokenId),
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_grantRole_calldata = (
		account: string,
		roleId: BigNumberish,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "grant_role",
			calldata: [account, roleId],
		};
	};

	const Marketplace_grantRole = async (
		snAccount: Account | AccountInterface,
		account: string,
		roleId: BigNumberish,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_grantRole_calldata(account, roleId),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_intent_calldata = (
		collection: string,
		quantity: BigNumberish,
		price: BigNumberish,
		currency: string,
		expiration: BigNumberish,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "intent",
			calldata: [collection, quantity, price, currency, expiration],
		};
	};

	const Marketplace_intent = async (
		snAccount: Account | AccountInterface,
		collection: string,
		quantity: BigNumberish,
		price: BigNumberish,
		currency: string,
		expiration: BigNumberish,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_intent_calldata(
					collection,
					quantity,
					price,
					currency,
					expiration,
				),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_list_calldata = (
		collection: string,
		tokenId: BigNumberish,
		quantity: BigNumberish,
		price: BigNumberish,
		currency: string,
		expiration: BigNumberish,
		royalties: boolean,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "list",
			calldata: [
				collection,
				tokenId,
				quantity,
				price,
				currency,
				expiration,
				royalties,
			],
		};
	};

	const Marketplace_list = async (
		snAccount: Account | AccountInterface,
		collection: string,
		tokenId: BigNumberish,
		quantity: BigNumberish,
		price: BigNumberish,
		currency: string,
		expiration: BigNumberish,
		royalties: boolean,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_list_calldata(
					collection,
					tokenId,
					quantity,
					price,
					currency,
					expiration,
					royalties,
				),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_offer_calldata = (
		collection: string,
		tokenId: BigNumberish,
		quantity: BigNumberish,
		price: BigNumberish,
		currency: string,
		expiration: BigNumberish,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "offer",
			calldata: [collection, tokenId, quantity, price, currency, expiration],
		};
	};

	const Marketplace_offer = async (
		snAccount: Account | AccountInterface,
		collection: string,
		tokenId: BigNumberish,
		quantity: BigNumberish,
		price: BigNumberish,
		currency: string,
		expiration: BigNumberish,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_offer_calldata(
					collection,
					tokenId,
					quantity,
					price,
					currency,
					expiration,
				),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_pause_calldata = (): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "pause",
			calldata: [],
		};
	};

	const Marketplace_pause = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_pause_calldata(),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_remove_calldata = (
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "remove",
			calldata: [orderId, collection, tokenId],
		};
	};

	const Marketplace_remove = async (
		snAccount: Account | AccountInterface,
		orderId: BigNumberish,
		collection: string,
		tokenId: BigNumberish,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_remove_calldata(orderId, collection, tokenId),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_resume_calldata = (): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "resume",
			calldata: [],
		};
	};

	const Marketplace_resume = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_resume_calldata(),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_revokeRole_calldata = (account: string): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "revoke_role",
			calldata: [account],
		};
	};

	const Marketplace_revokeRole = async (
		snAccount: Account | AccountInterface,
		account: string,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_revokeRole_calldata(account),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_setFee_calldata = (
		feeNum: BigNumberish,
		feeReceiver: string,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "set_fee",
			calldata: [feeNum, feeReceiver],
		};
	};

	const Marketplace_setFee = async (
		snAccount: Account | AccountInterface,
		feeNum: BigNumberish,
		feeReceiver: string,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_setFee_calldata(feeNum, feeReceiver),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_Marketplace_setRoyalties_calldata = (
		enabled: boolean,
	): DojoCall => {
		return {
			contractName: "Marketplace",
			entrypoint: "set_royalties",
			calldata: [enabled],
		};
	};

	const Marketplace_setRoyalties = async (
		snAccount: Account | AccountInterface,
		enabled: boolean,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_Marketplace_setRoyalties_calldata(enabled),
				"MARKETPLACE",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	return {
		Marketplace: {
			cancel: Marketplace_cancel,
			buildCancelCalldata: build_Marketplace_cancel_calldata,
			execute: Marketplace_execute,
			buildExecuteCalldata: build_Marketplace_execute_calldata,
			getValidities: Marketplace_getValidities,
			buildGetValiditiesCalldata: build_Marketplace_getValidities_calldata,
			getValidity: Marketplace_getValidity,
			buildGetValidityCalldata: build_Marketplace_getValidity_calldata,
			grantRole: Marketplace_grantRole,
			buildGrantRoleCalldata: build_Marketplace_grantRole_calldata,
			intent: Marketplace_intent,
			buildIntentCalldata: build_Marketplace_intent_calldata,
			list: Marketplace_list,
			buildListCalldata: build_Marketplace_list_calldata,
			offer: Marketplace_offer,
			buildOfferCalldata: build_Marketplace_offer_calldata,
			pause: Marketplace_pause,
			buildPauseCalldata: build_Marketplace_pause_calldata,
			remove: Marketplace_remove,
			buildRemoveCalldata: build_Marketplace_remove_calldata,
			resume: Marketplace_resume,
			buildResumeCalldata: build_Marketplace_resume_calldata,
			revokeRole: Marketplace_revokeRole,
			buildRevokeRoleCalldata: build_Marketplace_revokeRole_calldata,
			setFee: Marketplace_setFee,
			buildSetFeeCalldata: build_Marketplace_setFee_calldata,
			setRoyalties: Marketplace_setRoyalties,
			buildSetRoyaltiesCalldata: build_Marketplace_setRoyalties_calldata,
		},
	};
}
