import * as torii from "@dojoengine/torii-client";
import { Pinning, PinningEvent } from "./pinning";
import { Game, GameModel, Metadata, Socials } from "./game";
export type { PinningEvent, GameModel, Metadata, Socials };

export const Registry = {
  Pinning: Pinning,
  Game: Game,

  init: (toriiClient: torii.ToriiClient) => {
    Pinning.init(toriiClient);
    Game.init(toriiClient);
  },
};
