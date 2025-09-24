export * from "./arcade";
export * from "./collection";
export * from "./token";
export * from "./marketplace";
export * from "./metadata";
import type { constants } from "starknet";
import { configs } from "../configs";

export function useConfig(chainId: constants.StarknetChainId) {
  return configs[chainId];
}
