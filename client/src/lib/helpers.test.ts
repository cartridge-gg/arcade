import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { constants } from "starknet";
import {
  getChainId,
  getDuration,
  getTime,
  joinPaths,
  resizeImage,
} from "@/lib/helpers";

describe("helpers", () => {
  describe("getChainId", () => {
    it("returns SN_MAIN for mainnet rpc", () => {
      expect(getChainId("https://rpc.mainnet.starknet")).toBe(
        constants.StarknetChainId.SN_MAIN,
      );
    });

    it("returns SN_SEPOLIA for testnet rpc", () => {
      expect(getChainId("https://rpc.sepolia.starknet")).toBe(
        constants.StarknetChainId.SN_SEPOLIA,
      );
    });

    it("returns undefined when rpc is not provided", () => {
      expect(getChainId(undefined)).toBeUndefined();
    });
  });

  describe("getDuration", () => {
    it("formats values shorter than a minute", () => {
      expect(getDuration(45_000)).toBe("< 1m");
    });

    it("formats values in minutes", () => {
      expect(getDuration(90_000)).toBe("1m");
    });
  });

  describe("getTime", () => {
    const now = new Date("2024-01-01T00:00:00.000Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns elapsed time units", () => {
      const halfHourAgo = Math.floor(
        (now.getTime() - 30 * 60 * 1000) / 1000, // convert to seconds
      );
      const result = getTime(halfHourAgo);

      expect(result.minutes).toBe(30);
      expect(result.hours).toBe(0);
      expect(result.days).toBe(0);
    });
  });

  describe("joinPaths", () => {
    it("normalizes path segments", () => {
      expect(joinPaths("/game/", "/edition/main/", "collection")).toBe(
        "/game/edition/main/collection",
      );
    });

    it("filters empty segments", () => {
      expect(joinPaths("/", "collection", "", "/token/")).toBe(
        "/collection/token",
      );
    });
  });

  describe("resizeImage", () => {
    it("appends dimensions to valid urls", () => {
      const result = resizeImage(
        "https://example.com/image.png?foo=bar",
        200,
        300,
      );
      expect(result).toBe(
        "https://example.com/image.png?foo=bar&width=200&height=300",
      );
    });

    it("handles malformed urls gracefully", () => {
      const result = resizeImage("ipfs://example.png", 120, 240);
      expect(result).toBe("ipfs://example.png?width=120&height=240");
    });
  });
});
