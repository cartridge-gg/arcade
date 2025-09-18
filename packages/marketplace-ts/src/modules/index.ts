export * from "./marketplace";
import { init } from "@dojoengine/sdk";
import { configs } from "../configs";
import type { SchemaType } from "../bindings/models.gen";
import { type constants, shortString } from "starknet";

export const initSDK = async (chainId: constants.StarknetChainId) => {
	const config = configs[chainId];
	return init<SchemaType>({
		client: {
			toriiUrl: config.toriiUrl,
			worldAddress: config.manifest.world.address,
		},
		domain: {
			name: "Marketplace",
			version: "1.0",
			chainId: shortString.decodeShortString(chainId),
			revision: "1",
		},
	});
};
