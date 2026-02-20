// @vitest-environment edge-runtime
import { constants } from "starknet";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("edge runtime smoke", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads edge bundle and executes collection query path", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          contract_address: "0x1",
          contract_type: "ERC721",
          type: "ERC721",
          metadata: JSON.stringify({ name: "Smoke NFT" }),
          total_supply: "1",
          token_id: "1",
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock as any);

    const { createEdgeMarketplaceClient } = await import(
      "../dist/marketplace/edge.mjs"
    );
    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const collection = await client.getCollection({
      address: "0x1",
      fetchImages: false,
    });

    expect(collection).not.toBeNull();
    expect(collection?.projectId).toBe("arcade-main");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cartridge.gg/x/arcade-main/torii/sql",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
