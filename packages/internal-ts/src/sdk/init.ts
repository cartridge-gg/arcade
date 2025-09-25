import { init, type SchemaType } from "@dojoengine/sdk";
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
