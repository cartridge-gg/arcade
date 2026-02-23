import { describe, expect, it } from "vitest";

describe("sql benchmark helper resolution", () => {
  it("provides fallback benchmark helpers when dist module is missing them", async () => {
    const helpersUrl = new URL(
      "../../scripts/sql-benchmark-helpers.mjs",
      import.meta.url,
    );
    const { resolveBenchmarkHelpers } = await import(helpersUrl.href);

    const resolved = resolveBenchmarkHelpers({
      createMarketplaceClient: async () => ({}),
    });

    expect(resolved.createMarketplaceClient).toBeTypeOf("function");
    expect(resolved.runBenchmarkOperation).toBeTypeOf("function");
    expect(resolved.compareBenchmarkReports).toBeTypeOf("function");
    expect(resolved.evaluateBenchmarkRegressions).toBeTypeOf("function");
    expect(resolved.renderBenchmarkMarkdown).toBeTypeOf("function");

    const outcome = await resolved.runBenchmarkOperation({
      name: "op",
      warmup: 0,
      iterations: 1,
      execute: async () => ({ ok: true }),
      now: (() => {
        let n = 0;
        return () => {
          n += 5;
          return n;
        };
      })(),
    });

    expect(outcome.result?.name).toBe("op");
    expect(outcome.result?.stats.count).toBe(1);
  });
});
