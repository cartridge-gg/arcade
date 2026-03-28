import { describe, expect, it } from "vitest";
import {
  compareBenchmarkReports,
  computeBenchmarkStats,
  evaluateBenchmarkRegressions,
  renderBenchmarkMarkdown,
  runBenchmarkOperation,
  type BenchmarkReport,
} from "./benchmark";

describe("marketplace benchmark helpers", () => {
  it("computes percentile stats from sample durations", () => {
    const stats = computeBenchmarkStats([10, 20, 30, 40, 50]);

    expect(stats.count).toBe(5);
    expect(stats.minMs).toBe(10);
    expect(stats.maxMs).toBe(50);
    expect(stats.meanMs).toBe(30);
    expect(stats.p50Ms).toBe(30);
    expect(stats.p95Ms).toBe(50);
  });

  it("compares base and head reports by operation name", () => {
    const base: BenchmarkReport = {
      generatedAt: "2026-01-01T00:00:00.000Z",
      projectId: "arcade-main",
      collectionAddress: "0x1",
      warmup: 1,
      iterations: 3,
      operations: [
        {
          name: "listCollectionTokens:first-page",
          samplesMs: [20, 21, 22],
          stats: computeBenchmarkStats([20, 21, 22]),
        },
      ],
    };

    const head: BenchmarkReport = {
      ...base,
      generatedAt: "2026-01-02T00:00:00.000Z",
      operations: [
        {
          name: "listCollectionTokens:first-page",
          samplesMs: [15, 16, 17],
          stats: computeBenchmarkStats([15, 16, 17]),
        },
      ],
    };

    const rows = compareBenchmarkReports(base, head);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe("listCollectionTokens:first-page");
    expect(rows[0]?.deltaP50Pct).toBeLessThan(0);
    expect(rows[0]?.deltaP95Pct).toBeLessThan(0);
  });

  it("renders markdown summary for CI step output", () => {
    const report: BenchmarkReport = {
      generatedAt: "2026-01-02T00:00:00.000Z",
      projectId: "arcade-main",
      collectionAddress: "0x1",
      warmup: 1,
      iterations: 3,
      operations: [
        {
          name: "getCollection",
          samplesMs: [5, 6, 7],
          stats: computeBenchmarkStats([5, 6, 7]),
        },
      ],
    };

    const markdown = renderBenchmarkMarkdown(report);
    expect(markdown).toContain("SQL Benchmark Report");
    expect(markdown).toContain("getCollection");
    expect(markdown).toContain("| Operation |");
  });

  it("runs a benchmark operation and records success samples", async () => {
    let currentNow = 0;
    const now = () => {
      currentNow += 5;
      return currentNow;
    };

    const outcome = await runBenchmarkOperation({
      name: "listCollectionTokens:first-page",
      warmup: 1,
      iterations: 3,
      execute: async () => ({ ok: true }),
      now,
    });

    expect(outcome.result?.name).toBe("listCollectionTokens:first-page");
    expect(outcome.result?.stats.count).toBe(3);
    expect(outcome.result?.samplesMs).toEqual([5, 5, 5]);
    expect(outcome.failure).toBeUndefined();
  });

  it("marks operation as failed when execute throws", async () => {
    const outcome = await runBenchmarkOperation({
      name: "getCollection",
      warmup: 1,
      iterations: 2,
      execute: async () => {
        throw new Error("HTTP error! status: 400");
      },
    });

    expect(outcome.result).toBeUndefined();
    expect(outcome.failure?.name).toBe("getCollection");
    expect(outcome.failure?.error).toContain("400");
  });

  it("marks operation as failed when timeout elapses", async () => {
    const outcome = await runBenchmarkOperation({
      name: "fetchCollectionTraitMetadata",
      warmup: 1,
      iterations: 1,
      timeoutMs: 10,
      execute: async () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        }),
    });

    expect(outcome.result).toBeUndefined();
    expect(outcome.failure?.name).toBe("fetchCollectionTraitMetadata");
    expect(outcome.failure?.error).toContain("timed out");
  });

  it("renders failed operations in markdown output", () => {
    const report: BenchmarkReport = {
      generatedAt: "2026-01-02T00:00:00.000Z",
      projectId: "arcade-main",
      collectionAddress: "0x1",
      warmup: 1,
      iterations: 1,
      operations: [
        {
          name: "listCollectionTokens:first-page",
          samplesMs: [10],
          stats: computeBenchmarkStats([10]),
        },
      ],
      failures: [
        {
          name: "getCollection",
          error: "HTTP error! status: 400",
        },
      ],
    };

    const markdown = renderBenchmarkMarkdown(report);
    expect(markdown).toContain("Failed Operations");
    expect(markdown).toContain("getCollection");
    expect(markdown).toContain("status: 400");
  });

  it("flags deferred operation regressions above configured threshold", () => {
    const base: BenchmarkReport = {
      generatedAt: "2026-01-01T00:00:00.000Z",
      projectId: "arcade-main",
      collectionAddress: "0x1",
      warmup: 1,
      iterations: 3,
      operations: [
        {
          name: "listCollectionTokens:first-page:deferred",
          samplesMs: [100, 110, 120],
          stats: computeBenchmarkStats([100, 110, 120]),
        },
      ],
    };
    const head: BenchmarkReport = {
      ...base,
      operations: [
        {
          name: "listCollectionTokens:first-page:deferred",
          samplesMs: [140, 145, 150],
          stats: computeBenchmarkStats([140, 145, 150]),
        },
      ],
    };

    const rows = compareBenchmarkReports(base, head);
    const regressions = evaluateBenchmarkRegressions(rows, [
      {
        operationName: "listCollectionTokens:first-page:deferred",
        metric: "p95",
        maxDeltaPct: 10,
      },
    ]);

    expect(regressions).toHaveLength(1);
    expect(regressions[0]?.name).toBe(
      "listCollectionTokens:first-page:deferred",
    );
    expect(regressions[0]?.actualDeltaPct).toBeGreaterThan(10);
  });

  it("does not flag deferred operation when delta stays within threshold", () => {
    const base: BenchmarkReport = {
      generatedAt: "2026-01-01T00:00:00.000Z",
      projectId: "arcade-main",
      collectionAddress: "0x1",
      warmup: 1,
      iterations: 3,
      operations: [
        {
          name: "listCollectionTokens:next-page:deferred",
          samplesMs: [100, 110, 120],
          stats: computeBenchmarkStats([100, 110, 120]),
        },
      ],
    };
    const head: BenchmarkReport = {
      ...base,
      operations: [
        {
          name: "listCollectionTokens:next-page:deferred",
          samplesMs: [105, 112, 121],
          stats: computeBenchmarkStats([105, 112, 121]),
        },
      ],
    };

    const rows = compareBenchmarkReports(base, head);
    const regressions = evaluateBenchmarkRegressions(rows, [
      {
        operationName: "listCollectionTokens:next-page:deferred",
        metric: "p95",
        maxDeltaPct: 10,
      },
    ]);

    expect(regressions).toEqual([]);
  });
});
