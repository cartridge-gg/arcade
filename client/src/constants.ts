import { getChecksumAddress } from "starknet";

// Constants for the project
export const DEFAULT_PROJECT: string = "arcade-main";
export const DEFAULT_PRESET: string = "arcade";
export const DEFAULT_TOKENS_PROJECT: string = "c7e-tokens-starknet";
export const BLACKLISTS: string[] = [
  getChecksumAddress(
    "0x07fc27ad206a82c097260f92d822de9bf205095205747fadef9c596714491437",
  ),
];
// Constants required to query the achievement events
export const TROPHY: string = "TrophyCreation";
export const PROGRESS: string = "TrophyProgression";
