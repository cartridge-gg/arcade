import { constants } from "starknet";

export const getChainId = (rpc: string | undefined) => {
  if (!rpc) return undefined;
  if (rpc.includes("mainnet")) {
    return constants.StarknetChainId.SN_MAIN;
  }
  if (rpc.includes("testnet") || rpc.includes("sepolia")) {
    return constants.StarknetChainId.SN_SEPOLIA;
  }
  return constants.StarknetChainId.SN_MAIN;
};

export const getDuration = (deltatime: number, detailed?: boolean) => {
  const state = {
    seconds: Math.floor(deltatime / 1000),
    minutes: Math.floor(deltatime / (1000 * 60)),
    hours: Math.floor(deltatime / (1000 * 60 * 60)),
    days: Math.floor(deltatime / (1000 * 60 * 60 * 24)),
    months: Math.floor(deltatime / (1000 * 60 * 60 * 24 * 30)),
    years: Math.floor(deltatime / (1000 * 60 * 60 * 24 * 30 * 12)),
  };
  if (state.years > 0) {
    const months = detailed ? state.months % 12 : 0;
    return `${state.years}y${months > 0 ? ` ${months}mo` : ""}`;
  }
  if (state.months > 0) {
    const days = detailed ? state.days % 30 : 0;
    return `${state.months}mo${days > 0 ? ` ${days}d` : ""}`;
  }
  if (state.days > 0) {
    const hours = detailed ? state.hours % 24 : 0;
    return `${state.days}d${hours > 0 ? ` ${hours}h` : ""}`;
  }
  if (state.hours > 0) {
    const minutes = detailed ? state.minutes % 60 : 0;
    return `${state.hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  }
  if (state.minutes > 0) {
    const seconds = detailed ? state.seconds % 60 : 0;
    return `${state.minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
  }
  return "< 1m";
};

export const getTime = (timestamp: number) => {
  const now = new Date().getTime();
  const diff = now - timestamp * 1000;
  const state = {
    seconds: Math.floor(diff / 1000),
    minutes: Math.floor(diff / (1000 * 60)),
    hours: Math.floor(diff / (1000 * 60 * 60)),
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    months: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)),
    years: Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12)),
  };
  return state;
};

export const joinPaths = (...parts: string[]) => {
  return `/${parts
    .map((p) => p.replace(/^\/+|\/+$/g, "")) // trim leading/trailing slashes
    .filter(Boolean)
    .join("/")}`;
};

export { resizeImage } from "./image";
