import Game, { GameModel } from "./game";
import { initSDK } from "..";
import { constants } from "starknet";
import Achievement from "./achievement";

export * from "./policies";
export type { GameModel };

const Registry = {
  Game: Game,
  Achievement: Achievement,

  init: async (chainId: constants.StarknetChainId) => {
    const sdk = await initSDK(chainId);
    Game.init(sdk);
    Achievement.init(sdk);
  },
};

export default Registry;
