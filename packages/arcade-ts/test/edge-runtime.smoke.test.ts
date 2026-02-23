import { describe, expect, it } from "vitest";

describe("edge runtime smoke", () => {
  it("exports createEdgeMarketplaceClient from edge entry", async () => {
    const mod = await import("../src/marketplace/edge");
    expect(mod.createEdgeMarketplaceClient).toBeDefined();
    expect(typeof mod.createEdgeMarketplaceClient).toBe("function");
  });
});
