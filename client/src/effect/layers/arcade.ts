import { makeToriiLayer } from "@dojoengine/react/effect";
import { Atom } from "@effect-atom/atom-react";
import {
  BookModel,
  configs,
  EditionModel,
  GameModel,
  getToriiUrl,
  OrderModel,
} from "@cartridge/arcade";
import { constants } from "starknet";
import { DEFAULT_PROJECT } from "@/constants";

export const mainnetConfig = configs[constants.StarknetChainId.SN_MAIN];

const toriiLayer = makeToriiLayer(
  { manifest: mainnetConfig.manifest, toriiUrl: getToriiUrl(DEFAULT_PROJECT) },
  {
    autoReconnect: false,
    maxReconnectAttempts: 5,
    formatters: {
      models: {
        "ARCADE-Game": (m, ctx) =>
          GameModel.from(ctx.entityId, m) as unknown as Record<string, unknown>,
        "ARCADE-Edition": (m, ctx) =>
          EditionModel.from(ctx.entityId, m) as unknown as Record<
            string,
            unknown
          >,
        "ARCADE-Order": (m, ctx) =>
          OrderModel.from(ctx.entityId, m) as unknown as Record<
            string,
            unknown
          >,
        "ARCADE-Book": (m, ctx) =>
          BookModel.from(ctx.entityId, m) as unknown as Record<string, unknown>,
      },
    },
  },
);

export const toriiRuntime = Atom.runtime(toriiLayer);
