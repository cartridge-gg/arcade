import { describe, expect, it } from "vitest";
import { getToriiAssetUrl } from "./torii";

const CONTRACT_ADDRESS =
  "0x10cf2e2beb27753b7b46248d211614a6c3e4593371716cec9b952e43aaadd6";
const NORMALIZED_CONTRACT_ADDRESS =
  "0x0010cf2e2beb27753b7b46248d211614a6c3e4593371716cec9b952e43aaadd6";
const TOKEN_ID =
  "0x000000000000000000000000000000000000000000000000000000000000001a";

describe("getToriiAssetUrl", () => {
  it("normalizes the contract address for collection images", () => {
    expect(getToriiAssetUrl("gbomb-mainnet", CONTRACT_ADDRESS)).toBe(
      `https://api.cartridge.gg/x/gbomb-mainnet/torii/static/${NORMALIZED_CONTRACT_ADDRESS}/image`,
    );
  });

  it("normalizes the contract address for token images", () => {
    expect(getToriiAssetUrl("gbomb-mainnet", CONTRACT_ADDRESS, TOKEN_ID)).toBe(
      `https://api.cartridge.gg/x/gbomb-mainnet/torii/static/${NORMALIZED_CONTRACT_ADDRESS}/${TOKEN_ID}/image`,
    );
  });
});
