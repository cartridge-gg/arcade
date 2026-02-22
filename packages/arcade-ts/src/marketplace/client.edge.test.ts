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

  it("uses keyset pagination for token queries and emits keyset cursor", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [
        {
          endpoint: "arcade-main",
          data: [
            {
              contract_address: "0xabc",
              token_id: "2",
              metadata: JSON.stringify({ name: "Token 2" }),
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
      limit: 1,
      fetchImages: false,
    });

    expect(result.error).toBeNull();
    expect(result.page?.nextCursor).toBe("keyset:2");

    const sql = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(sql).not.toContain("OFFSET");
  });

  it("applies keyset cursor to token query predicate", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    await client.listCollectionTokens({
      address: "0xabc",
      cursor: "keyset:9",
      limit: 25,
      fetchImages: false,
    });

    const sql = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(sql).toContain("token_id > '9'");
    expect(sql).not.toContain("OFFSET");
  });

  it("pushes attribute filters into SQL instead of filtering client-side", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    await client.listCollectionTokens({
      address: "0xabc",
      attributeFilters: {
        rarity: new Set(["legendary", "epic"]),
        class: new Set(["wizard"]),
      },
      fetchImages: false,
    });

    const sql = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(sql).toContain("FROM token_attributes");
    expect(sql).toContain("HAVING COUNT(DISTINCT trait_name) = 2");
    expect(sql).toContain("trait_name = 'rarity'");
    expect(sql).toContain("trait_name = 'class'");
  });

  it("applies default order limit when getCollectionOrders limit is omitted", async () => {
    mockedFetchToriisSql.mockResolvedValueOnce({
      data: [{ endpoint: "arcade-main", data: [] }],
      errors: [],
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    await client.getCollectionOrders({
      collection: "0xabc",
    });

    const sql = mockedFetchToriisSql.mock.calls[0]?.[1] ?? "";
    expect(sql).toContain("ORDER BY id DESC LIMIT 100");
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
