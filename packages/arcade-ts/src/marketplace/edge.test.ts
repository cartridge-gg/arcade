import { describe, expect, it } from "vitest";
import * as edgeMarketplace from "./edge";

describe("marketplace edge entrypoint", () => {
  it("exports runtime helpers for edge consumers", () => {
    expect(edgeMarketplace.resolveMarketplaceRuntimeMode).toBeTypeOf(
      "function",
    );
  });

  it("exports trait metadata fetchers", () => {
    expect(edgeMarketplace.fetchCollectionTraitMetadata).toBeTypeOf("function");
    expect(edgeMarketplace.fetchTraitNamesSummary).toBeTypeOf("function");
    expect(edgeMarketplace.fetchTraitValues).toBeTypeOf("function");
  });
});
