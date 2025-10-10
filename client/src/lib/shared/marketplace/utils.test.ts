import { describe, it, expect, beforeEach, vi } from "vitest";
import type { OrderModel, SaleEvent } from "@cartridge/arcade";
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

const buildSale = (overrides: Partial<SaleEvent>): SaleEvent =>
  ({
    time: 10,
    order: buildOrder({}),
    ...overrides,
  }) as SaleEvent;

describe("shared marketplace utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatPriceInfo", () => {
    it("uses metadata decimals and logo when available", () => {
      const info = formatPriceInfo("0x1", 1_000_000);
      expect(info).toEqual({
        value: "1",
        image: "https://example.com/usdc.png",
      });
    });

    it("falls back to generated blockie and provided decimals", () => {
      const info = formatPriceInfo("0x2", 500, 2);
      expect(info).toEqual({
        value: "5",
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
      expect(price?.value).toBe("0.9");
    });

    it("handles nullish collections", () => {
      expect(deriveBestPrice(undefined)).toBeNull();
    });
  });

  describe("deriveLatestSalePrice", () => {
    it("returns the price of the most recent sale", () => {
      const sales: Record<string, Record<string, SaleEvent>> = {
        "1": {
          a: buildSale({ time: 5, order: buildOrder({ price: 1_100_000 }) }),
          b: buildSale({ time: 15, order: buildOrder({ price: 600_000 }) }),
        },
      };
      const price = deriveLatestSalePrice(sales);
      expect(price?.value).toBe("0.6");
    });

    it("returns null when no sales exist", () => {
      expect(deriveLatestSalePrice({})).toBeNull();
    });
  });

  describe("deriveLatestSalePriceForToken", () => {
    it("returns newest sale for a token", () => {
      const sales: Record<string, SaleEvent> = {
        old: buildSale({ time: 1, order: buildOrder({ price: 2_000_000 }) }),
        recent: buildSale({
          time: 10,
          order: buildOrder({ price: 1_500_000 }),
        }),
      };
      const price = deriveLatestSalePriceForToken(sales);
      expect(price?.value).toBe("1.5");
    });

    it("returns null when token sales are missing", () => {
      expect(deriveLatestSalePriceForToken(undefined)).toBeNull();
    });
  });
});
