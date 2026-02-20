import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchToriis } from "./torii-fetcher";

// Mock the ToriiClient for client callbacks
vi.mock("@dojoengine/torii-client", () => ({
  ToriiClient: vi.fn().mockImplementation(() => ({
    free: vi.fn(),
  })),
}));

describe("torii-fetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export fetchToriis function", () => {
    expect(fetchToriis).toBeDefined();
    expect(typeof fetchToriis).toBe("function");
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
    const mockCallback = vi.fn().mockResolvedValue({ data: [], count: 0 });

    const res = await fetchToriis(["arcade-blobarena", "arcade-main"], {
      client: mockCallback,
    });

    const totalEndpoints = res.metadata?.totalEndpoints ?? 0;
    const successfulEndpoints = res.metadata?.successfulEndpoints ?? 0;
    const failedEndpoints = res.metadata?.failedEndpoints ?? 0;

    expect(totalEndpoints).toBe(2);
    expect(successfulEndpoints + failedEndpoints).toBe(2);
    expect(res.data).toHaveLength(successfulEndpoints);
    expect(mockCallback).toHaveBeenCalledTimes(successfulEndpoints);
  });

  it("should return errors when callback throws", async () => {
    const mockCallback = vi.fn().mockRejectedValueOnce(new Error("boom"));

    const res = await fetchToriis(["arcade-blobarena"], {
      client: mockCallback,
    });

    expect(res.errors).toBeDefined();
    expect(res.metadata?.failedEndpoints).toBe(1);
    expect(res.errors?.[0]?.message).toContain("boom");
  });

  it("should reject SQL-only options for compatibility safety", async () => {
    const res = await fetchToriis(
      ["arcade-blobarena"],
      { sql: "SELECT 1" } as any,
    );

    expect(res.errors).toBeDefined();
    expect(res.metadata?.failedEndpoints).toBe(1);
    expect(res.errors?.[0]?.message).toContain("Client callback is required");
    expect(res.errors?.[0]?.message).toContain("fetchToriisSql");
  });
});
