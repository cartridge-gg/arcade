export * from "./registry";
export * from "./social";
import { init } from "@dojoengine/sdk";
import { configs } from "../configs";
import { SchemaType, schema } from "../bindings/models.gen";
import { constants, shortString } from "starknet";

export const initSDK = async (chainId: constants.StarknetChainId) => {
  const config = configs[chainId];
  return init<SchemaType>(
    {
      client: {
        rpcUrl: config.rpcUrl,
        toriiUrl: config.toriiUrl,
        relayUrl: config.relayUrl,
        worldAddress: config.manifest.world.address,
      },
      domain: {
        name: "Arcade",
        version: "1.0",
        chainId: shortString.decodeShortString(chainId),
        revision: "1",
      },
    },
    schema,
  );
};
