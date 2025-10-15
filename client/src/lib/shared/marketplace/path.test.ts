import { describe, it, expect } from "vitest";
import { buildMarketplaceTargetPath } from "@/lib/shared/marketplace/path";
import type { GameModel, EditionModel } from "@cartridge/arcade";

describe("buildMarketplaceTargetPath", () => {
  const game = {
    id: 1,
    name: "New Game",
  } as unknown as GameModel;

  const edition = {
    id: 10,
    name: "Special Edition",
  } as unknown as EditionModel;

  it("replaces existing route segments and appends the target collection", () => {
    const basePath = "/game/old-entry/edition/main/player/0xabc/tab/items";

    const target = buildMarketplaceTargetPath(basePath, "0xABC", game, edition);

    expect(target).toBe(
      "/game/new-game/edition/special-edition/collection/0xabc",
    );
  });

  it("falls back to collection route when game context is absent", () => {
    const target = buildMarketplaceTargetPath(
      "/marketplace",
      "0xDEF",
      null,
      null,
    );
    expect(target).toBe("/collection/0xdef");
  });
});
