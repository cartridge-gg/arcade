const round = (value, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const percentile = (sorted, p) => {
  if (!sorted.length) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  const boundedIndex = Math.min(sorted.length - 1, Math.max(0, index));
  return sorted[boundedIndex];
};

const computeBenchmarkStats = (samplesMs) => {
  if (!samplesMs.length) {
    throw new Error("Cannot compute benchmark stats with zero samples");
  }

  const sorted = [...samplesMs].sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);

  return {
    count: sorted.length,
    minMs: round(sorted[0]),
    maxMs: round(sorted[sorted.length - 1]),
    meanMs: round(total / sorted.length),
    p50Ms: round(percentile(sorted, 50)),
    p95Ms: round(percentile(sorted, 95)),
  };
};

const normalizeErrorMessage = (error) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
};

const withTimeout = async (promise, timeoutMs) => {
  if (!timeoutMs || timeoutMs <= 0) {
    return promise;
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => clearTimeout(timer));
  });
};

export const fallbackRunBenchmarkOperation = async (options) => {
  const {
    name,
    warmup,
    iterations,
    timeoutMs,
    execute,
    now = () => Date.now(),
  } = options;

  try {
    let lastResult;

    for (let index = 0; index < warmup; index += 1) {
      lastResult = await withTimeout(execute(), timeoutMs);
    }

    const samplesMs = [];
    for (let index = 0; index < iterations; index += 1) {
      const startedAt = now();
      lastResult = await withTimeout(execute(), timeoutMs);
      samplesMs.push(round(now() - startedAt));
    }

    return {
      result: {
        name,
        samplesMs,
        stats: computeBenchmarkStats(samplesMs),
      },
      lastResult,
    };
  } catch (error) {
    return {
      failure: {
        name,
        error: normalizeErrorMessage(error),
      },
    };
  }
};

const percentDelta = (base, head) => {
  if (base === 0) return 0;
  return round(((head - base) / base) * 100);
};

export const fallbackCompareBenchmarkReports = (base, head) => {
  const baseByName = new Map(base.operations.map((op) => [op.name, op]));
  const rows = [];

  for (const operation of head.operations) {
    const baseOp = baseByName.get(operation.name);
    if (!baseOp) continue;

    rows.push({
      name: operation.name,
      baseP50Ms: baseOp.stats.p50Ms,
      headP50Ms: operation.stats.p50Ms,
      deltaP50Pct: percentDelta(baseOp.stats.p50Ms, operation.stats.p50Ms),
      baseP95Ms: baseOp.stats.p95Ms,
      headP95Ms: operation.stats.p95Ms,
      deltaP95Pct: percentDelta(baseOp.stats.p95Ms, operation.stats.p95Ms),
    });
  }

  return rows;
};

const formatDelta = (value) => {
  const signed = value > 0 ? `+${value}` : `${value}`;
  return `${signed}%`;
};

const escapeTableCell = (value) =>
  value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

export const fallbackRenderBenchmarkMarkdown = (
  report,
  comparison = [],
) => {
  const lines = [];
  lines.push("## SQL Benchmark Report");
  lines.push("");
  lines.push(`- Project: \`${report.projectId}\``);
  lines.push(`- Collection: \`${report.collectionAddress}\``);
  lines.push(`- Generated: \`${report.generatedAt}\``);
  lines.push(`- Warmup: \`${report.warmup}\``);
  lines.push(`- Iterations: \`${report.iterations}\``);
  lines.push("");
  lines.push("| Operation | p50 (ms) | p95 (ms) | mean (ms) |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const operation of report.operations) {
    lines.push(
      `| ${operation.name} | ${operation.stats.p50Ms} | ${operation.stats.p95Ms} | ${operation.stats.meanMs} |`,
    );
  }

  if (report.failures && report.failures.length > 0) {
    lines.push("");
    lines.push("### Failed Operations");
    lines.push("");
    lines.push("| Operation | Error |");
    lines.push("| --- | --- |");
    for (const failure of report.failures) {
      lines.push(
        `| ${escapeTableCell(failure.name)} | ${escapeTableCell(
          failure.error,
        )} |`,
      );
    }
  }

  if (comparison.length > 0) {
    lines.push("");
    lines.push("### Base vs Head");
    lines.push("");
    lines.push(
      "| Operation | base p50 | head p50 | delta p50 | base p95 | head p95 | delta p95 |",
    );
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const row of comparison) {
      lines.push(
        `| ${row.name} | ${row.baseP50Ms} | ${row.headP50Ms} | ${formatDelta(
          row.deltaP50Pct,
        )} | ${row.baseP95Ms} | ${row.headP95Ms} | ${formatDelta(
          row.deltaP95Pct,
        )} |`,
      );
    }
  }

  return lines.join("\n");
};

export const resolveBenchmarkHelpers = (marketplace) => {
  const { createMarketplaceClient, fetchCollectionTraitMetadata, fetchTraitValues } =
    marketplace ?? {};

  if (!createMarketplaceClient) {
    throw new Error("createMarketplaceClient export was not found");
  }

  const runBenchmarkOperation =
    marketplace?.runBenchmarkOperation ?? fallbackRunBenchmarkOperation;
  const compareBenchmarkReports =
    marketplace?.compareBenchmarkReports ?? fallbackCompareBenchmarkReports;
  const renderBenchmarkMarkdown =
    marketplace?.renderBenchmarkMarkdown ?? fallbackRenderBenchmarkMarkdown;

  const usingFallbackHelpers =
    !marketplace?.runBenchmarkOperation ||
    !marketplace?.compareBenchmarkReports ||
    !marketplace?.renderBenchmarkMarkdown;

  return {
    createMarketplaceClient,
    fetchCollectionTraitMetadata,
    fetchTraitValues,
    runBenchmarkOperation,
    compareBenchmarkReports,
    renderBenchmarkMarkdown,
    usingFallbackHelpers,
  };
};
