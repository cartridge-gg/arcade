export * from "./registry";
import { init } from "@dojoengine/sdk";
import { config } from "../configs";
import { SchemaType, schema } from "../bindings/models.gen";

export const initSDK = async () => init<SchemaType>(
    {
        client: {
            rpcUrl: config.rpcUrl,
            toriiUrl: config.toriiUrl,
            relayUrl: config.relayUrl,
            worldAddress: config.manifest.world.address,
        },
        domain: {
            name: "Arcade",
            version: "1.0",
            chainId: "KATANA",
            revision: "1",
        },
    },
    schema
);