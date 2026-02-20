import { beforeEach, describe, expect, it, vi } from "vitest";
import { constants } from "starknet";
import { createMarketplaceClient } from "./client";
import { fetchToriisSql } from "../modules/torii-sql-fetcher";

vi.mock("../modules/torii-sql-fetcher", () => ({
  fetchToriisSql: vi.fn(),
}));

const mockedFetchToriisSql = vi.mocked(fetchToriisSql);

describe("createMarketplaceClient runtime routing", () => {
  beforeEach(() => {
    mockedFetchToriisSql.mockReset();
  });

  it("routes edge mode to the edge client implementation", async () => {
    mockedFetchToriisSql.mockResolvedValue({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
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
    expect(mockedFetchToriisSql).toHaveBeenCalledWith(
      ["arcade-main"],
      expect.stringContaining("FROM token_contracts"),
    );
  });
});
