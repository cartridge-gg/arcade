/**
 * Constants for SSR meta tag generation
 */

export const API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";

// Active game projects for achievement queries
export const ACTIVE_PROJECTS = [
  { model: "", namespace: "dopewars", project: "dopewars" },
  { model: "", namespace: "loot_survivor", project: "loot-survivor" },
  { model: "", namespace: "underdark", project: "underdark" },
  { model: "", namespace: "zkube", project: "zkube" },
  { model: "", namespace: "blobert", project: "blobert" },
  { model: "", namespace: "zdefender", project: "zdefender" },
  { model: "", namespace: "realm", project: "realm" },
  { model: "", namespace: "eternum", project: "eternum" },
  { model: "", namespace: "ponziland", project: "ponziland" },
  { model: "", namespace: "evolute_genesis", project: "evolute-genesis" },
  { model: "", namespace: "pistols", project: "pistols" },
];

// Game configuration for OG images
// Contains all metadata needed for each game's OG image generation
export interface GameConfig {
  name: string;     // Display name for the game
  icon: string;     // Icon/logo URL
  cover: string;    // Cover/banner image URL
  color: string;    // Primary brand color
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  "dopewars": {
    name: "Dope Wars",
    icon: "https://static.cartridge.gg/presets/dope-wars/icon.png",
    cover: "https://static.cartridge.gg/presets/dope-wars/cover.png",
    color: "#11ED83",
  },
  "loot-survivor": {
    name: "Loot Survivor",
    icon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    cover: "https://static.cartridge.gg/presets/loot-survivor/cover.png",
    color: "#33FF33",
  },
  "underdark": {
    name: "Dark Shuffle",
    icon: "https://static.cartridge.gg/presets/underdark/icon.png",
    cover: "https://static.cartridge.gg/presets/underdark/cover.png",
    color: "#F59100",
  },
  "zkube": {
    name: "zKube",
    icon: "https://static.cartridge.gg/presets/zkube/icon.png",
    cover: "https://static.cartridge.gg/presets/zkube/cover.png",
    color: "#5bc3e6",
  },
  "blobert": {
    name: "Blob Arena",
    icon: "https://static.cartridge.gg/presets/blob-arena-amma/icon.png",
    cover: "https://static.cartridge.gg/presets/blob-arena-amma/cover.png",
    color: "#D7B000",
  },
  "zdefender": {
    name: "zDefender",
    icon: "https://static.cartridge.gg/presets/zdefender/icon.png",
    cover: "https://static.cartridge.gg/presets/zdefender/cover.png",
    color: "#F59100",
  },
  "realm": {
    name: "Eternum",
    icon: "https://static.cartridge.gg/presets/eternum/icon.svg",
    cover: "https://static.cartridge.gg/presets/eternum/cover.png",
    color: "#dc8b07",
  },
  "eternum": {
    name: "Eternum",
    icon: "https://static.cartridge.gg/presets/eternum/icon.svg",
    cover: "https://static.cartridge.gg/presets/eternum/cover.png",
    color: "#dc8b07",
  },
  "ponziland": {
    name: "Ponziland",
    icon: "https://static.cartridge.gg/presets/ponziland/icon.svg",
    cover: "https://static.cartridge.gg/presets/ponziland/cover.png",
    color: "#F38332",
  },
  "evolute-genesis": {
    name: "Mage Duel",
    icon: "https://static.cartridge.gg/presets/mage-duel/icon.png",
    cover: "https://static.cartridge.gg/presets/mage-duel/cover.png",
    color: "#BD835B",
  },
  "pistols": {
    name: "Pistols at Dawn",
    icon: "https://static.cartridge.gg/presets/pistols/icon.png",
    cover: "https://static.cartridge.gg/presets/pistols/cover.png",
    color: "#EF9758",
  },
};

