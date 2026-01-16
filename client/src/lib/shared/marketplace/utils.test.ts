import { describe, it, expect, beforeEach, vi } from "vitest";
import type { OrderModel } from "@cartridge/arcade";
import {
  formatPriceInfo,
  deriveBestPrice,
  deriveLatestSalePrice,
  deriveLatestSalePriceForToken,
} from "@/lib/shared/marketplace/utils";

vi.mock("@cartridge/presets", () => ({
  erc20Metadata: [
    {
      l2_token_address: "0x1",
      logo_url: "https://example.com/usdc.png",
      decimals: 6,
    },
  ],
}));

vi.mock("ethereum-blockies-base64", () => ({
  __esModule: true,
  default: (value: string) => `blockie:${value}`,
}));

const buildOrder = (overrides: Partial<OrderModel>): OrderModel =>
  ({
    price: 1_000_000, // 1 unit with 6 decimals
    currency: "0x1",
    status: { value: "Placed" },
    ...overrides,
  }) as OrderModel;

describe("shared marketplace utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatPriceInfo", () => {
    it("uses metadata decimals and logo when available", () => {
      const info = formatPriceInfo("0x1", 1_000_000);
      expect(info).toEqual({
        value: "1.0000",
        image: "https://example.com/usdc.png",
      });
    });

    it("falls back to generated blockie and provided decimals", () => {
      const info = formatPriceInfo("0x2", 500, 2);
      expect(info).toEqual({
        value: "5.0000",
        image: "blockie:0x2",
      });
    });

    it("decimals (2,4)", () => {
      const info = formatPriceInfo("0x2", 87654321, 2);
      expect(info).toEqual({
        value: "876543.2100",
        image: "blockie:0x2",
      });
    });
    it("decimals (2,2)", () => {
      const info = formatPriceInfo("0x2", 87654321, 2, 2);
      expect(info).toEqual({
        value: "876543.21",
        image: "blockie:0x2",
      });
    });
    it("decimals (6,4)", () => {
      const info = formatPriceInfo("0x2", 87654321, 6);
      expect(info).toEqual({
        value: "87.6543",
        image: "blockie:0x2",
      });
    });
    it("decimals (6,2)", () => {
      const info = formatPriceInfo("0x2", 87654321, 6, 2);
      expect(info).toEqual({
        value: "87.65",
        image: "blockie:0x2",
      });
    });
    it("decimals (2,4,trim-2)", () => {
      const info = formatPriceInfo("0x2", 87654321, 2, 4, true);
      expect(info).toEqual({
        value: "876543.21",
        image: "blockie:0x2",
      });
    });
    it("decimals (2,4,trim-3)", () => {
      const info = formatPriceInfo("0x2", 876543210, 2, 4, true);
      expect(info).toEqual({
        value: "8765432.1",
        image: "blockie:0x2",
      });
    });
    it("decimals (2,4,trim-4)", () => {
      const info = formatPriceInfo("0x2", 8765432100, 2, 4, true);
      expect(info).toEqual({
        value: "87654321",
        image: "blockie:0x2",
      });
    });
  });

  describe("deriveBestPrice", () => {
    it("returns the cheapest order across tokens", () => {
      const orders = {
        "1": [buildOrder({ price: 900_000 })],
        "2": [buildOrder({ price: 2_000_000 })],
      };

      const price = deriveBestPrice(orders);
      expect(price?.value).toBe("0.9000");
    });

    it("handles nullish collections", () => {
      expect(deriveBestPrice(undefined)).toBeNull();
    });
  });

  describe("deriveLatestSalePrice", () => {
    it("returns the price of the most recent sale", () => {
      const sales: Record<string, Record<string, OrderModel>> = {
        "1": {
          a: buildOrder({ id: 5, price: 1_100_000 }) as OrderModel,
          b: buildOrder({ id: 15, price: 600_000 }) as OrderModel,
        },
      };
      const price = deriveLatestSalePrice(sales);
      expect(price?.value).toBe("0.6000");
    });

    it("returns null when no sales exist", () => {
      expect(deriveLatestSalePrice({})).toBeNull();
    });
  });

  describe("deriveLatestSalePriceForToken", () => {
    it("returns newest sale for a token", () => {
      const sales: Record<string, OrderModel> = {
        old: buildOrder({ id: 1, price: 2_000_000 }) as OrderModel,
        recent: buildOrder({ id: 10, price: 1_500_000 }) as OrderModel,
      };
      const price = deriveLatestSalePriceForToken(sales);
      expect(price?.value).toBe("1.5000");
    });

    it("returns null when token sales are missing", () => {
      expect(deriveLatestSalePriceForToken(undefined)).toBeNull();
    });
  });
});
