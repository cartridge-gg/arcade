import { getToriiUrl } from "@cartridge/arcade";

export const DEFAULT_PROJECT = "arcade-main";

export const toriiConfig = {
  toriiUrl: getToriiUrl(DEFAULT_PROJECT),
  worldAddress: "0x0",
  project: DEFAULT_PROJECT,
} as const;

export type ToriiConfig = typeof toriiConfig;
