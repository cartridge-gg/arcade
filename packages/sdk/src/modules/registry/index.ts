import * as torii from "@dojoengine/torii-client";
import { Pinning, PinningEvent } from "./pinning";
export type { PinningEvent };

export const Registry = {
  Pinning: Pinning,

  init: (toriiClient: torii.ToriiClient) => {
    Pinning.init(toriiClient);
  },
};
