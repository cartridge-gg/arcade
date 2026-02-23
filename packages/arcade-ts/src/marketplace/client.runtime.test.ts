import { beforeEach, describe, expect, it, vi } from "vitest";
import { constants } from "starknet";
import { createMarketplaceClient } from "./client";
import { fetchToriis } from "../modules/torii-fetcher";

vi.mock("../modules/torii-fetcher", () => ({
  fetchToriis: vi.fn(),
}));

vi.mock("../modules/init-sdk", () => ({
  initArcadeSDK: vi.fn().mockResolvedValue({
    getEntities: vi.fn().mockResolvedValue({ getItems: () => [] }),
  }),
}));

const mockedFetchToriis = vi.mocked(fetchToriis);

describe("createMarketplaceClient runtime routing", () => {
  beforeEach(() => {
    mockedFetchToriis.mockReset();
  });

  it("routes edge mode to the edge client implementation", async () => {
    mockedFetchToriis.mockResolvedValue({
      data: [{ items: [], next_cursor: null }],
      metadata: {
        totalEndpoints: 1,
        successfulEndpoints: 1,
        failedEndpoints: 0,
      },
    } as any);

    const client = await createMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
      runtime: "edge",
    });

    const collection = await client.getCollection({
      address: "0x1",
      fetchImages: false,
    });

    expect(collection).toBeNull();
    expect(mockedFetchToriis).toHaveBeenCalledWith(
      ["arcade-main"],
      expect.objectContaining({
        client: expect.any(Function),
      }),
    );
  });
});
