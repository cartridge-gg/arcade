import { describe, it, expect, beforeAll } from "vitest";
import { constants } from "starknet";
import type { MarketplaceClient } from "./types";
import { CategoryType, StatusType } from "../classes";

const runIntegration = process.env.RUN_INTEGRATION_TESTS === "true";

const TEST_CONFIG = {
  chainId: constants.StarknetChainId.SN_MAIN,
  defaultProject: "arcade-main",
};

const TEST_COLLECTION =
  "0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4";

describe.skipIf(!runIntegration)("marketplace client integration", () => {
  let client: MarketplaceClient;

  beforeAll(async () => {
    const { createMarketplaceClient } = await import("./client");
    client = await createMarketplaceClient(TEST_CONFIG);
  }, 30000);

  describe("getCollection", () => {
    it("fetches real collection metadata when available", async () => {
      const collection = await client.getCollection({
        address: TEST_COLLECTION,
      });

      if (collection) {
        expect(collection.address).toBeDefined();
        expect(collection.contractType).toBeDefined();
        expect(typeof collection.totalSupply).toBe("bigint");
        expect(collection.metadata).toBeDefined();
      }
    }, 30000);

    it("returns null for non-existent address", async () => {
      const collection = await client.getCollection({
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
      });

      expect(collection).toBeNull();
    }, 30000);
  });

  describe("listCollectionTokens", () => {
    it("fetches real tokens with pagination", async () => {
      const result = await client.listCollectionTokens({
        address: TEST_COLLECTION,
        limit: 5,
      });

      expect(result.error).toBeNull();
      expect(result.page).not.toBeNull();
      expect(Array.isArray(result.page?.tokens)).toBe(true);
    }, 30000);

    it("respects limit parameter", async () => {
      const result = await client.listCollectionTokens({
        address: TEST_COLLECTION,
        limit: 2,
      });

      expect(result.error).toBeNull();
      expect(result.page?.tokens.length).toBeLessThanOrEqual(2);
    }, 30000);

    it("handles cursor-based pagination", async () => {
      const firstPage = await client.listCollectionTokens({
        address: TEST_COLLECTION,
        limit: 2,
      });

      expect(firstPage.error).toBeNull();

      if (firstPage.page?.nextCursor) {
        const secondPage = await client.listCollectionTokens({
          address: TEST_COLLECTION,
          limit: 2,
          cursor: firstPage.page.nextCursor,
        });

        expect(secondPage.error).toBeNull();
        expect(secondPage.page).not.toBeNull();
      }
    }, 30000);
  });

  describe("getCollectionOrders", () => {
    it("fetches real orders", async () => {
      const orders = await client.getCollectionOrders({
        collection: TEST_COLLECTION,
        limit: 10,
      });

      expect(Array.isArray(orders)).toBe(true);

      if (orders.length > 0) {
        const order = orders[0];
        expect(order.collection).toBeDefined();
        expect(order.status).toBeDefined();
        expect(order.category).toBeDefined();
      }
    }, 30000);

    it("filters by status", async () => {
      const orders = await client.getCollectionOrders({
        collection: TEST_COLLECTION,
        status: StatusType.Placed,
        limit: 10,
      });

      expect(Array.isArray(orders)).toBe(true);
      orders.forEach((order) => {
        expect(order.status.value).toBe(StatusType.Placed);
      });
    }, 30000);

    it("filters by category", async () => {
      const orders = await client.getCollectionOrders({
        collection: TEST_COLLECTION,
        category: CategoryType.Sell,
        limit: 10,
      });

      expect(Array.isArray(orders)).toBe(true);
      orders.forEach((order) => {
        expect(order.category.value).toBe(CategoryType.Sell);
      });
    }, 30000);
  });

  describe("listCollectionListings", () => {
    it("returns only Sell + Placed orders", async () => {
      const listings = await client.listCollectionListings({
        collection: TEST_COLLECTION,
        limit: 10,
      });

      expect(Array.isArray(listings)).toBe(true);
      listings.forEach((listing) => {
        expect(listing.category.value).toBe(CategoryType.Sell);
        expect(listing.status.value).toBe(StatusType.Placed);
      });
    }, 30000);
  });

  describe("getToken", () => {
    it("fetches real token details when exists", async () => {
      const tokensResult = await client.listCollectionTokens({
        address: TEST_COLLECTION,
        limit: 1,
      });

      const token = tokensResult.page?.tokens[0];
      if (token?.token_id) {
        const tokenDetails = await client.getToken({
          collection: TEST_COLLECTION,
          tokenId: token.token_id,
        });

        expect(tokenDetails).not.toBeNull();
        expect(tokenDetails?.token).toBeDefined();
        expect(Array.isArray(tokenDetails?.orders)).toBe(true);
        expect(Array.isArray(tokenDetails?.listings)).toBe(true);
      }
    }, 60000);

    it("returns null for non-existent token", async () => {
      const tokenDetails = await client.getToken({
        collection: TEST_COLLECTION,
        tokenId: "999999999999999999",
      });

      expect(tokenDetails).toBeNull();
    }, 30000);
  });
});
