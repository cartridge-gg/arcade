import { describe, expect, it, vi } from "vitest";

const { mockedGetChecksumAddress } = vi.hoisted(() => ({
  mockedGetChecksumAddress: vi.fn((address: string) => `ck:${address}`),
}));

vi.mock("starknet", async () => {
  const actual = await vi.importActual<typeof import("starknet")>("starknet");
  return {
    ...actual,
    getChecksumAddress: mockedGetChecksumAddress,
  };
});

import { normalizeTokens } from "./utils";

describe("marketplace utils", () => {
  it("memoizes checksum resolution for repeated contract addresses", async () => {
    mockedGetChecksumAddress.mockClear();

    await normalizeTokens(
      [
        {
          contract_address: "0xabc",
          token_id: "1",
          metadata: "{}",
          name: "",
          symbol: "",
          decimals: 0,
        },
        {
          contract_address: "0xabc",
          token_id: "2",
          metadata: "{}",
          name: "",
          symbol: "",
          decimals: 0,
        },
      ] as any,
      "arcade-main",
      { fetchImages: false },
    );

    expect(mockedGetChecksumAddress).toHaveBeenCalledTimes(1);
  });
});
