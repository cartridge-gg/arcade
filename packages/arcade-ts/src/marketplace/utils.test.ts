import type { Token, TokenContract } from "@dojoengine/torii-wasm/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultResolveContractImage, defaultResolveTokenImage } from "./utils";

const CONTRACT_ADDRESS =
  "0x10cf2e2beb27753b7b46248d211614a6c3e4593371716cec9b952e43aaadd6";
const NORMALIZED_CONTRACT_ADDRESS =
  "0x0010cf2e2beb27753b7b46248d211614a6c3e4593371716cec9b952e43aaadd6";

describe("Torii image resolvers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes contract addresses in token image URLs", async () => {
    const image = await defaultResolveTokenImage(
      {
        contract_address: CONTRACT_ADDRESS,
        token_id: "0x1a",
      } as Token,
      { projectId: "gbomb-mainnet" },
    );

    expect(image).toBe(
      `https://api.cartridge.gg/x/gbomb-mainnet/torii/static/${NORMALIZED_CONTRACT_ADDRESS}/0x000000000000000000000000000000000000000000000000000000000000001a/image`,
    );
  });

  it("normalizes contract addresses in collection image URLs", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true } as Response);

    const image = await defaultResolveContractImage(
      { contract_address: CONTRACT_ADDRESS } as TokenContract,
      { projectId: "gbomb-mainnet" },
    );

    const expected = `https://api.cartridge.gg/x/gbomb-mainnet/torii/static/${NORMALIZED_CONTRACT_ADDRESS}/image`;
    expect(image).toBe(expected);
    expect(fetchSpy).toHaveBeenCalledWith(expected, { method: "HEAD" });
  });
});
