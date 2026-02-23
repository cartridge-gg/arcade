import { beforeEach, describe, expect, it, vi } from "vitest";
import { constants } from "starknet";
import { createEdgeMarketplaceClient } from "./client.edge";
import { fetchToriis } from "../modules/torii-fetcher";
import { fetchCollectionTokens, fetchTokenBalances } from "./tokens";

vi.mock("../modules/torii-fetcher", () => ({
  fetchToriis: vi.fn(),
}));

vi.mock("./tokens", () => ({
  fetchCollectionTokens: vi.fn(),
  fetchTokenBalances: vi.fn(),
}));

vi.mock("../modules/init-sdk", () => ({
  initArcadeSDK: vi.fn().mockResolvedValue({
    getEntities: vi.fn().mockResolvedValue({ getItems: () => [] }),
  }),
}));

const mockedFetchToriis = vi.mocked(fetchToriis);
const mockedFetchCollectionTokens = vi.mocked(fetchCollectionTokens);
const mockedFetchTokenBalances = vi.mocked(fetchTokenBalances);

const emptyGrpcResponse = (items: any[] = []) => ({
  data: [{ items, next_cursor: null }],
  metadata: {
    totalEndpoints: 1,
    successfulEndpoints: 1,
    failedEndpoints: 0,
  },
});

describe("createEdgeMarketplaceClient", () => {
  beforeEach(() => {
    mockedFetchToriis.mockReset();
    mockedFetchCollectionTokens.mockReset();
    mockedFetchTokenBalances.mockReset();
  });

  it("returns null when collection is missing", async () => {
    mockedFetchToriis.mockResolvedValueOnce(emptyGrpcResponse() as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const collection = await client.getCollection({
      address: "0x1",
      fetchImages: false,
    });

    expect(collection).toBeNull();
    expect(mockedFetchToriis).toHaveBeenCalledWith(
      ["arcade-main"],
      expect.objectContaining({ client: expect.any(Function) }),
    );
  });

  it("falls back to token sample lookup when contract metadata is missing", async () => {
    // First call: getTokenContracts returns contract without metadata
    mockedFetchToriis.mockResolvedValueOnce(
      emptyGrpcResponse([
        {
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000001",
          contract_type: "ERC721",
          metadata: "",
          total_supply: "1",
        },
      ]) as any,
    );
    // Second call: getTokens returns token with metadata
    mockedFetchToriis.mockResolvedValueOnce(
      emptyGrpcResponse([
        {
          contract_address: "0x1",
          token_id: "42",
          metadata: JSON.stringify({ name: "Fallback Token" }),
        },
      ]) as any,
    );

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const collection = await client.getCollection({
      address: "0x1",
      fetchImages: false,
    });

    expect(collection).not.toBeNull();
    expect(collection?.tokenIdSample).toBe("42");
    expect(mockedFetchToriis).toHaveBeenCalledTimes(2);
  });

  it("lists tokens through gRPC transport via fetchCollectionTokens", async () => {
    mockedFetchCollectionTokens.mockResolvedValueOnce({
      page: {
        tokens: [
          {
            contract_address: "0xabc",
            token_id: "0x1",
            metadata: { name: "Token 1" },
          } as any,
        ],
        nextCursor: null,
      },
      error: null,
    });

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
    expect(mockedFetchCollectionTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "0xabc",
        project: "arcade-main",
      }),
    );
  });

  it("hydrates metadata for normalized token ids through batch API", async () => {
    mockedFetchCollectionTokens.mockResolvedValueOnce({
      page: {
        tokens: [
          {
            contract_address: "0xabc",
            token_id: "1",
            metadata: { name: "Token 1" },
          } as any,
          {
            contract_address: "0xabc",
            token_id: "2",
            metadata: { name: "Token 2" },
          } as any,
        ],
        nextCursor: null,
      },
      error: null,
    });

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const tokens = await client.getCollectionTokenMetadataBatch({
      address: "0xabc",
      tokenIds: ["1", "2"],
    });

    expect(tokens).toHaveLength(2);
    expect(mockedFetchCollectionTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        includeMetadata: true,
      }),
    );
  });

  it("returns empty metadata batch when token ids are invalid", async () => {
    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const tokens = await client.getCollectionTokenMetadataBatch({
      address: "0xabc",
      tokenIds: [],
    });

    expect(tokens).toHaveLength(0);
    expect(mockedFetchCollectionTokens).not.toHaveBeenCalled();
  });

  it("uses SDK entity queries for getCollectionOrders", async () => {
    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const orders = await client.getCollectionOrders({
      collection: "0xabc",
    });

    expect(orders).toEqual([]);
  });

  it("verifies listing ownership via gRPC token balances", async () => {
    // Mock SDK to return a placed sell order
    const mockOrder = {
      models: {
        ARCADE: {
          Order: {
            id: 1,
            category: 2, // Sell
            status: 1, // Placed
            expiration: Math.floor(Date.now() / 1000) + 3600,
            collection: "0xabc",
            token_id: 1,
            quantity: 1,
            price: 100,
            currency: "0x0",
            owner: "0x123",
          },
        },
      },
    };

    const { initArcadeSDK } = await import("../modules/init-sdk");
    vi.mocked(initArcadeSDK).mockResolvedValueOnce({
      getEntities: vi.fn().mockResolvedValue({
        getItems: () => [mockOrder],
      }),
    } as any);

    mockedFetchTokenBalances.mockResolvedValueOnce({
      page: { balances: [], nextCursor: null },
      error: null,
    });

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const listings = await client.listCollectionListings({
      collection: "0xabc",
      verifyOwnership: true,
    });

    // Order won't pass ownership check since balance is empty
    expect(listings).toEqual([]);
  });

  it("skips ownership verification when verifyOwnership is false", async () => {
    const { initArcadeSDK } = await import("../modules/init-sdk");
    vi.mocked(initArcadeSDK).mockResolvedValueOnce({
      getEntities: vi.fn().mockResolvedValue({ getItems: () => [] }),
    } as any);

    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const listings = await client.listCollectionListings({
      collection: "0xabc",
      verifyOwnership: false,
    });

    expect(listings).toEqual([]);
    expect(mockedFetchTokenBalances).not.toHaveBeenCalled();
  });

  it("uses SDK entity queries for getFees", async () => {
    const client = await createEdgeMarketplaceClient({
      chainId: constants.StarknetChainId.SN_MAIN,
    });

    const fees = await client.getFees();
    expect(fees).toBeNull();
  });
});
