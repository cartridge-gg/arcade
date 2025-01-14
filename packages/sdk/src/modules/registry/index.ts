import { Pinning, PinningEvent } from "./pinning";
import { Game, GameModel, Metadata, Socials } from "./game";
import { initSDK } from "..";
import { constants } from "starknet";
export type { PinningEvent, GameModel, Metadata, Socials };

export const Registry = {
  Pinning: Pinning,
  Game: Game,

  init: async (chainId: constants.StarknetChainId) => {
    const sdk = await initSDK(chainId);
    Pinning.init(sdk);
    Game.init(sdk);
  },
};
