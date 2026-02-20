import { describe, expect, it } from "vitest";
import {
  type MarketplaceRuntimeMode,
  getMarketplaceClientRuntimeMode,
  resolveMarketplaceRuntimeMode,
} from "./runtime";

describe("marketplace runtime mode", () => {
  it("defaults to dojo when mode is undefined", () => {
    const mode = resolveMarketplaceRuntimeMode(undefined);
    expect(mode).toBe("dojo" satisfies MarketplaceRuntimeMode);
  });

  it("resolves edge mode explicitly", () => {
    const mode = resolveMarketplaceRuntimeMode("edge");
    expect(mode).toBe("edge" satisfies MarketplaceRuntimeMode);
  });

  it("keeps auto mode as dojo for the M1 skeleton", () => {
    const mode = resolveMarketplaceRuntimeMode("auto");
    expect(mode).toBe("dojo" satisfies MarketplaceRuntimeMode);
  });

  it("returns edge client runtime when requested", () => {
    expect(getMarketplaceClientRuntimeMode("edge")).toBe("edge");
  });

  it("returns dojo client runtime for undefined and auto", () => {
    expect(getMarketplaceClientRuntimeMode(undefined)).toBe("dojo");
    expect(getMarketplaceClientRuntimeMode("auto")).toBe("dojo");
  });
});
