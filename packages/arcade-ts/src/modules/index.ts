import { init } from "@dojoengine/sdk";
import { SchemaType } from "../bindings";
import { constants, shortString } from "starknet";

import { configs } from "../configs";

interface DomainOptions {
  name: string;
  version?: string;
  revision?: string;
}

export const createInitSDK = <TSchema extends SchemaType = SchemaType>({
  name,
  version = "1.0",
  revision = "1",
}: DomainOptions) => {
  return async (chainId: constants.StarknetChainId) => {
    const config = configs[chainId];

    if (!config) {
      throw new Error(`Missing config for chain ${chainId}`);
    }

    return init<TSchema>({
      client: {
        toriiUrl: config.toriiUrl,
        worldAddress: config.manifest.world.address,
      },
      domain: {
        name,
        version,
        chainId: shortString.decodeShortString(chainId),
        revision,
      },
    });
  };
};

export const initArcadeSDK = createInitSDK<SchemaType>({ name: "Arcade" });

export * from "./registry";
export * from "./social";
export * from "./marketplace";
export * from "./torii-fetcher";
