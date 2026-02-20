export type MarketplaceRuntimeMode = "dojo" | "edge" | "auto";

export type ResolvedMarketplaceRuntimeMode = Exclude<
  MarketplaceRuntimeMode,
  "auto"
>;

export interface ToriiTransport {
  getToriiUrl: (projectId: string) => string;
}

export interface MarketplaceReadRuntime {
  mode: ResolvedMarketplaceRuntimeMode;
  transport?: ToriiTransport;
}

export const resolveMarketplaceRuntimeMode = (
  mode?: MarketplaceRuntimeMode,
): ResolvedMarketplaceRuntimeMode => {
  if (mode === "edge") return "edge";
  return "dojo";
};

export const getMarketplaceClientRuntimeMode = (
  mode?: MarketplaceRuntimeMode,
): ResolvedMarketplaceRuntimeMode => {
  return resolveMarketplaceRuntimeMode(mode);
};
