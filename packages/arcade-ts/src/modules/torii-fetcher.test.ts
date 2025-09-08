import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchToriis } from "./torii-fetcher";

// Mock the ToriiClient for client callbacks
vi.mock("@dojoengine/torii-client", () => ({
  ToriiClient: vi.fn().mockImplementation(() => ({
    free: vi.fn(),
  })),
}));

// Mock global fetch for SQL queries
global.fetch = vi.fn();

describe("torii-fetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });

  it("should export fetchToriis function", () => {
    expect(fetchToriis).toBeDefined();
    expect(typeof fetchToriis).toBe("function");
  });

  it("should handle SQL queries", async () => {
    const mockResponse = {
      data: [{ id: 1, name: "test" }],
      count: 1,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const res = await fetchToriis(["arcade-blobarena"], {
      sql: "SELECT * FROM ARCADE-Edition",
      pagination: {
        limit: 10,
      },
    });

    expect(res).toBeDefined();
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.metadata).toBeDefined();
    expect(res.metadata?.totalEndpoints).toBe(1);
    expect(res.metadata?.successfulEndpoints).toBe(1);

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.cartridge.gg/x/arcade-blobarena/torii",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: "SELECT * FROM ARCADE-Edition",
          limit: 10,
          cursor: undefined,
        }),
      }),
    );
  });

  it("should handle client callback", async () => {
    const mockCallback = vi.fn().mockResolvedValue({ test: "data" });

    const res = await fetchToriis(["arcade-blobarena"], {
      client: mockCallback,
    });

    expect(res).toBeDefined();
    expect(res.data).toBeDefined();
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        client: expect.any(Object),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("should handle multiple endpoints", async () => {
    const mockResponse = { data: [], count: 0 };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const res = await fetchToriis(["arcade-blobarena", "arcade-mainnet"], {
      sql: "SELECT * FROM TestModel LIMIT 5",
    });

    expect(res.metadata?.totalEndpoints).toBe(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("should handle HTTP errors gracefully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const res = await fetchToriis(["arcade-blobarena"], {
      sql: "SELECT * FROM TestModel",
    });

    expect(res.errors).toBeDefined();
    expect(res.metadata?.failedEndpoints).toBe(1);
    expect(res.errors?.[0]?.message).toContain("HTTP error! status: 500");
  });

  it("should handle network errors gracefully", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const res = await fetchToriis(["arcade-blobarena"], {
      sql: "SELECT * FROM TestModel",
    });

    expect(res.errors).toBeDefined();
    expect(res.metadata?.failedEndpoints).toBe(1);
  });

  describe("pagination", () => {
    it("should support pagination options", async () => {
      const mockResponse = { data: [], cursor: "next-cursor" };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const res = await fetchToriis(["arcade-blobarena"], {
        sql: "SELECT * FROM TestModel",
        pagination: {
          limit: 10,
          cursor: "test-cursor",
          direction: "Forward",
        },
      });

      expect(res).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            sql: "SELECT * FROM TestModel",
            limit: 10,
            cursor: "test-cursor",
          }),
        }),
      );
    });
  });
});
