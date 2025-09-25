import { createInitSDK } from "@cartridge/internal";
import type { SchemaType } from "@cartridge/models";

export * from "./registry";
export * from "./social";
export * from "./torii-fetcher";

export const initArcadeSDK = createInitSDK<SchemaType>({ name: "Arcade" });
