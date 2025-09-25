import { createInitSDK } from "@cartridge/internal";
import type { SchemaType } from "@cartridge/models";

export * from "./marketplace";

export const initMarketplaceSDK = createInitSDK<SchemaType>({
  name: "Marketplace",
});
