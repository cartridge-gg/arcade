import { Atom } from "@effect-atom/atom-react";
import { makeToriiLayer, ToriiGrpcClient } from "@dojoengine/react/effect";
import { toriiConfig } from "./config";

export { ToriiGrpcClient };

const toriiLayer = makeToriiLayer(
  {
    manifest: {},
    toriiUrl: toriiConfig.toriiUrl,
  },
  {
    worldAddress: toriiConfig.worldAddress,
    autoReconnect: true,
    maxReconnectAttempts: 5,
  },
);

export const toriiRuntime = Atom.runtime(toriiLayer);
