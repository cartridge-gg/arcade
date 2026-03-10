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

  it("uses keyset pagination instead of offset pagination", async () => {
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
      cursor: "1",
      limit: 1,
      fetchImages: false,
    });

    expect(result.error).toBeNull();
    expect(result.page?.tokens[0]?.token_id).toBe("2");
    expect(mockedFetchToriisSql).toHaveBeenCalledWith(
      ["arcade-main"],
      expect.stringContaining("token_id > '1'"),
    );
    expect(mockedFetchToriisSql).not.toHaveBeenCalledWith(
      ["arcade-main"],
      expect.stringContaining("OFFSET"),
    );
  });

  it("continues fetching raw SQL pages until it fills a filtered page", async () => {
    mockedFetchToriisSql
      .mockResolvedValueOnce({
        data: [
          {
            endpoint: "arcade-main",
            data: [
              {
                contract_address: "0xabc",
                token_id: "1",
                metadata: JSON.stringify({
                  name: "Token 1",
                  attributes: [{ trait_type: "rarity", value: "common" }],
                }),
              },
            ],
          },
        ],
        errors: [],
      } as any)
      .mockResolvedValueOnce({
        data: [
          {
            endpoint: "arcade-main",
            data: [
              {
                contract_address: "0xabc",
                token_id: "2",
                metadata: JSON.stringify({
                  name: "Token 2",
                  attributes: [{ trait_type: "rarity", value: "legendary" }],
                }),
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
      attributeFilters: { rarity: ["legendary"] },
      fetchImages: false,
    });

    expect(result.error).toBeNull();
    expect(result.page?.tokens).toHaveLength(1);
    expect(result.page?.tokens[0]?.token_id).toBe("2");
    expect(result.page?.nextCursor).toBe("2");
    expect(mockedFetchToriisSql).toHaveBeenCalledTimes(2);
    expect(mockedFetchToriisSql.mock.calls[1]?.[1]).toContain("token_id > '1'");
  });

  it("verifies ownership with exact predicates and a SQL-side zero-balance filter", async () => {
    mockedFetchToriisSql
      .mockResolvedValueOnce({
        data: [
          {
            endpoint: "arcade-main",
            data: [
              {
                id: 7,
                category: 2,
                status: 1,
                expiration: Math.floor(Date.now() / 1000) + 3600,
                collection:
                  "0x0000000000000000000000000000000000000000000000000000000000000abc",
                token_id: "1",
                quantity: 1,
                price: 1,
                currency:
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
                owner:
                  "0x0000000000000000000000000000000000000000000000000000000000000def",
              },
            ],
          },
        ],
        errors: [],
      } as any)
      .mockResolvedValueOnce({
        data: [
          {
            endpoint: "arcade-main",
            data: [
              {
                account_address:
                  "0x0000000000000000000000000000000000000000000000000000000000000def",
                token_id: "1",
                balance: "0x1",
              },
            ],
          },
        ],
        errors: [],
      } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const listings = await client.listCollectionListings({
      collection: "0xabc",
      limit: 1,
    });

    expect(listings).toHaveLength(1);
    expect(mockedFetchToriisSql.mock.calls[0]?.[1]).toContain(
      "collection = '0x0000000000000000000000000000000000000000000000000000000000000abc'",
    );
    expect(mockedFetchToriisSql.mock.calls[1]?.[1]).toContain(
      "contract_address = '0x0000000000000000000000000000000000000000000000000000000000000abc'",
    );
    expect(mockedFetchToriisSql.mock.calls[1]?.[1]).toContain(
      "balance != '0x0000000000000000000000000000000000000000000000000000000000000000'",
    );
    expect(mockedFetchToriisSql.mock.calls[1]?.[1]).not.toContain("lower(");
  });
});
