import { Pinning, PinningEvent } from "./pinning";
import { Game, GameModel, Metadata, Socials } from "./game";
import { initSDK } from "..";
export type { PinningEvent, GameModel, Metadata, Socials };

export const Registry = {
  Pinning: Pinning,
  Game: Game,

  init: async () => {
    const sdk = await initSDK();
    Pinning.init(sdk);
    Game.init(sdk);
  },
};
