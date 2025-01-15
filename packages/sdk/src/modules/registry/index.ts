import { initSDK } from "..";
import { constants } from "starknet";
import { Game, GameModel } from "./game";
import { Achievement, AchievementModel } from "./achievement";

export * from "./policies";
export type { GameModel, AchievementModel };

export const Registry = {
  Game: Game,
  Achievement: Achievement,

  init: async (chainId: constants.StarknetChainId) => {
    const sdk = await initSDK(chainId);
    Game.init(sdk);
    Achievement.init(sdk);
  },
};
