import { beforeEach, describe, expect, it, vi } from "vitest";
import { constants } from "starknet";
import { createEdgeMarketplaceClient } from "./client.edge";
import { fetchToriisSql } from "../modules/torii-sql-fetcher";

vi.mock("../modules/torii-sql-fetcher", () => ({
  fetchToriisSql: vi.fn(),
}));

const mockedFetchToriisSql = vi.mocked(fetchToriisSql);

describe("createEdgeMarketplaceClient", () => {
  beforeEach(() => {
    mockedFetchToriisSql.mockReset();
  });

  it("returns null when collection is missing", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
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

  it("lists tokens through SQL transport", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [
        {
          endpoint: "arcade-main",
          data: [
            {
              contract_address: "0xabc",
              token_id: "0x1",
              metadata: JSON.stringify({ name: "Token 1" }),
            },
          ],
        },
      ],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const result = await client.listCollectionTokens({
      address: "0xabc",
      fetchImages: false,
    });

    expect(result.error).toBeNull();
    expect(result.page?.tokens).toHaveLength(1);
    expect(result.page?.tokens[0]?.metadata?.name).toBe("Token 1");
    expect(mockedFetchToriisSql).toHaveBeenCalledWith(
      ["arcade-main"],
      expect.stringContaining("FROM tokens"),
    );
  });
});
