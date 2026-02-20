import { getMarketplaceClientRuntimeMode } from "./runtime";
import type { MarketplaceClient, MarketplaceClientConfig } from "./types";

export async function createMarketplaceClient(
  config: MarketplaceClientConfig,
): Promise<MarketplaceClient> {
  const mode = getMarketplaceClientRuntimeMode(config.runtime);

  if (mode === "edge") {
    const { createEdgeMarketplaceClient } = await import("./client.edge");
    return createEdgeMarketplaceClient(config);
  }

  const { createDojoMarketplaceClient } = await import("./client.dojo");
  return createDojoMarketplaceClient(config);
}
