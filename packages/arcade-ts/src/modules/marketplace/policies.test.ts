import { beforeEach, describe, expect, it, vi } from "vitest";
import { constants } from "starknet";

const core = vi.hoisted(() => ({
  getContractByName: vi.fn(),
}));

vi.mock("@dojoengine/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dojoengine/core")>();
  return { ...actual, getContractByName: core.getContractByName };
});

import { getMarketplacePolicies } from "./policies";

describe("getMarketplacePolicies", () => {
  beforeEach(() => {
    core.getContractByName.mockReset();
  });

  it("throws an explicit error when the marketplace contract is missing", () => {
    core.getContractByName.mockReturnValue(undefined);

    expect(() =>
      getMarketplacePolicies(constants.StarknetChainId.SN_MAIN),
    ).toThrowError("Missing ARCADE-Marketplace contract");
  });
});
