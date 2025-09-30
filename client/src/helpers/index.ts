import { constants } from "starknet";

export const getChainId = (rpc: string | undefined) => {
  if (!rpc) return undefined;
  if (rpc.includes("mainnet")) {
    return constants.StarknetChainId.SN_MAIN;
  } else if (rpc.includes("testnet") || rpc.includes("sepolia")) {
    return constants.StarknetChainId.SN_SEPOLIA;
  }
  return constants.StarknetChainId.SN_MAIN;
};

export const getDuration = (deltatime: number) => {
  const state = {
    seconds: Math.floor(deltatime / 1000),
    minutes: Math.floor(deltatime / (1000 * 60)),
    hours: Math.floor(deltatime / (1000 * 60 * 60)),
    days: Math.floor(deltatime / (1000 * 60 * 60 * 24)),
    months: Math.floor(deltatime / (1000 * 60 * 60 * 24 * 30)),
    years: Math.floor(deltatime / (1000 * 60 * 60 * 24 * 30 * 12)),
  };
  if (state.years > 0) return `${state.years}y`;
  if (state.months > 0) return `${state.months}mo`;
  if (state.days > 0) return `${state.days}d`;
  if (state.hours > 0) return `${state.hours}h`;
  if (state.minutes > 0) return `${state.minutes}m`;
  return `< 1m`;
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
  return (
    "/" +
    parts
      .map((p) => p.replace(/^\/+|\/+$/g, "")) // trim leading/trailing slashes
      .filter(Boolean)
      .join("/")
  );
};
