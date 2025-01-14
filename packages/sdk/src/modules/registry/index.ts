import { Game, GameModel } from "./game";
import { initSDK } from "..";
import { constants } from "starknet";
import { Achievement } from "./achievement";
import { configs } from "../../configs";
import { getContractByName } from "../../provider/helpers";

export type { GameModel };

export const Registry = {
  address: undefined as string | undefined,
  Game: Game,
  Achievement: Achievement,

  init: async (chainId: constants.StarknetChainId) => {
    const config = configs[chainId];
    const address = getContractByName(config.manifest, "Registry");
    const sdk = await initSDK(chainId);
    Registry.address = address;
    Game.init(sdk, address);
    Achievement.init(sdk, address);
  },

  policies: () => {
    if (!Registry.address) {
      throw new Error("Registry module is not initialized");
    }
    return {
      contracts: {
        [Registry.address]: {
          name: "Registry",
          description: "Registry contract for games and achievements",
          methods: [...Game.methods(), ...Achievement.methods()],
        },
      },
    };
  },
};
