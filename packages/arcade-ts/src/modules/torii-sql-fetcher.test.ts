import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchToriisSql } from "./torii-sql-fetcher";

global.fetch = vi.fn();

describe("torii-sql-fetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("builds endpoint-specific torii sql urls", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    const result = await fetchToriisSql(["arcade-blobarena", "arcade-main"], "SELECT 1");

    expect(result.metadata?.totalEndpoints).toBe(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "https://api.cartridge.gg/x/arcade-blobarena/torii/sql",
      expect.objectContaining({ method: "POST", body: "SELECT 1" }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.cartridge.gg/x/arcade-main/torii/sql",
      expect.objectContaining({ method: "POST", body: "SELECT 1" }),
    );
  });

  it("returns errors for non-2xx responses", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const result = await fetchToriisSql(["arcade-main"], "SELECT 1");

    expect(result.errors).toBeDefined();
    expect(result.errors?.[0]?.message).toContain("HTTP error! status: 500");
    expect(result.metadata?.failedEndpoints).toBe(1);
  });
});
