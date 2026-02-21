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

  it("normalizes tokenIds before building SQL IN clause", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    await client.listCollectionTokens({
      address: "0xabc",
      tokenIds: ["0x1"],
      fetchImages: false,
    });

    const sql = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(sql).toContain("token_id IN ('1')");
  });

  it("returns null nextCursor when limit is invalid and no rows are returned", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const result = await client.listCollectionTokens({
      address: "0xabc",
      limit: 0,
      fetchImages: false,
    });

    expect(result.error).toBeNull();
    expect(result.page?.nextCursor).toBeNull();
  });

  it("short-circuits invalid orderIds without issuing malformed SQL", async () => {
    mockedFetchToriisSql.mockResolvedValue({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const orders = await client.getCollectionOrders({
      collection: "0xabc",
      orderIds: [Number.NaN as unknown as number],
    });

    expect(orders).toEqual([]);
    expect(mockedFetchToriisSql).not.toHaveBeenCalled();
  });
});
