export * from "./registry";
export * from "./social";
export * from "./torii-fetcher";
import { init, initGrpc } from "@dojoengine/sdk";
import { configs } from "../configs";
import { SchemaType } from "../bindings/models.gen";
import { constants, shortString } from "starknet";

export const initSDK = async (chainId: constants.StarknetChainId) => {
  const config = configs[chainId];
  const grpcClient = initGrpc({ toriiUrl: config.toriiUrl, worldAddress: config.manifest.world.address });
  return init<SchemaType>({
    client: {
      toriiUrl: config.toriiUrl,
      worldAddress: config.manifest.world.address,
    },
    domain: {
      name: "Arcade",
      version: "1.0",
      chainId: shortString.decodeShortString(chainId),
      revision: "1",
    },
    grpcClient
  });
};
