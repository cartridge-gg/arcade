import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCollectionTokens } from "./tokens";
import { fetchToriis } from "../modules/torii-fetcher";

vi.mock("../modules/torii-fetcher", () => ({
  fetchToriis: vi.fn(),
}));
const mockFetchToriis = vi.mocked(fetchToriis);

const sampleToken = {
  contract_address:
    "0x01e6d8a8173ab9ed2a1538c9d9a6bbf24f03b80aa00dbd8c91ac20f1f09c0c1d",
  token_id: "0x1",
  metadata: JSON.stringify({ name: "Sample" }),
  name: "Sample",
};

describe("fetchCollectionTokens", () => {
  beforeEach(() => {
    mockFetchToriis.mockReset();
  });

  it("fetches and normalizes tokens", async () => {
    mockFetchToriis.mockResolvedValueOnce({
      data: [
        {
          items: [sampleToken],
          next_cursor: "next",
        },
      ],
    } as any);

    const resolveTokenImage = vi
      .fn()
      .mockResolvedValue("https://image.example");

    const result = await fetchCollectionTokens({
      address:
        "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
      project: "projectA",
      attributeFilters: { rarity: new Set(["legendary"]) },
      cursor: "cursor1",
      limit: 50,
      resolveTokenImage,
    });

    expect(mockFetchToriis).toHaveBeenCalledWith(
      ["projectA"],
      expect.objectContaining({
        client: expect.any(Function),
      }),
    );

    const callArgs = mockFetchToriis.mock.calls[0][1];
    const clientFn = callArgs.client;
    expect(typeof clientFn).toBe("function");
    const mockClient = {
      getTokens: vi.fn().mockResolvedValue({
        items: [sampleToken],
        next_cursor: "next",
      }),
    };

    await (clientFn as (params: any) => Promise<any>)({
      client: mockClient,
    } as any);

    expect(mockClient.getTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute_filters: [{ trait_name: "rarity", trait_value: "legendary" }],
        pagination: expect.objectContaining({
          limit: 50,
          cursor: "cursor1",
        }),
      }),
    );

    expect(result.error).toBeNull();
    expect(result.page).not.toBeNull();
    expect(result.page?.nextCursor).toBe("next");
    expect(result.page?.tokens).toHaveLength(1);
    expect(result.page?.tokens[0].image).toBe("https://image.example");
    expect(resolveTokenImage).toHaveBeenCalled();
  });

  it("captures errors", async () => {
    mockFetchToriis.mockRejectedValueOnce(new Error("network error"));

    const result = await fetchCollectionTokens({
      address:
        "0x04f51290f2b0e16524084c27890711c7a955eb276cffec185d6f24f2a620b15f",
      project: "projectA",
    });

    expect(result.page).toBeNull();
    expect(result.error?.error).toBeInstanceOf(Error);
    expect(result.error?.error.message).toBe("network error");
  });
});
