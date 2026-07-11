import { describe, expect, it, vi } from "vitest";
import { constants, type GetTransactionReceiptResponse } from "starknet";

import { BaseProvider } from "./base";

const receipt = {
  isReverted: () => false,
} as GetTransactionReceiptResponse;

describe("BaseProvider", () => {
  it("constructs a Torii client with the configured world", () => {
    const ToriiClient = vi.fn();
    const provider = new BaseProvider(constants.StarknetChainId.SN_MAIN, {
      namespace: "ARCADE",
      torii: { ToriiClient },
    });

    provider.getToriiClient("https://torii.example");

    expect(ToriiClient).toHaveBeenCalledWith({
      toriiUrl: "https://torii.example",
      worldAddress: provider.manifest.world.address,
    });
  });

  it("executes with the supplied account and waits through its provider", async () => {
    const provider = new BaseProvider(constants.StarknetChainId.SN_MAIN, {
      namespace: "ARCADE",
      torii: { ToriiClient: vi.fn() },
    });
    const execute = vi
      .spyOn(provider, "execute")
      .mockResolvedValue({ transaction_hash: "0x123" });
    const waitForTransaction = vi
      .spyOn(provider.provider, "waitForTransaction")
      .mockResolvedValue(receipt);
    const account = { address: "0xabc" };
    const calls = [{ contractAddress: "0x1", entrypoint: "play" }];

    await provider.invoke(account as never, calls);

    expect(execute).toHaveBeenCalledWith(account, calls, "ARCADE");
    expect(waitForTransaction).toHaveBeenCalledWith("0x123", {
      retryInterval: 500,
    });
  });
});
