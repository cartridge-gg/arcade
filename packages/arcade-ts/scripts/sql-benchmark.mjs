#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { constants } from "starknet";

const DEFAULT_COLLECTION =
  "0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4";
const DEFAULT_PROJECT_ID = "arcade-main";
const DEFAULT_ATTRIBUTE_FILTERS_JSON = '{"beast id":["trait"]}';

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const toBoolean = (value, fallback = false) => {
  if (value == null || `${value}`.trim().length === 0) {
    return fallback;
  }

  const normalized = `${value}`.trim().toLowerCase();
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
};

const parseAttributeFilters = (jsonInput) => {
  if (!jsonInput || jsonInput.trim().length === 0) return undefined;

  let parsed;
  try {
    parsed = JSON.parse(jsonInput);
  } catch (error) {
    throw new Error(
      `Invalid BENCH_ATTRIBUTE_FILTERS_JSON value: ${String(error)}`,
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("BENCH_ATTRIBUTE_FILTERS_JSON must be a JSON object");
  }

  const normalized = {};
  for (const [trait, values] of Object.entries(parsed)) {
    if (!Array.isArray(values)) continue;
    const filtered = values
      .map((value) => String(value))
      .filter((value) => value.length > 0);
    if (filtered.length === 0) continue;
    normalized[trait] = filtered;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const ensureDir = async (targetFile) => {
  const dir = path.dirname(targetFile);
  await fs.mkdir(dir, { recursive: true });
};

const loadMarketplaceModule = async (distDir) => {
  const target = path.resolve(distDir, "marketplace/index.mjs");
  const moduleUrl = pathToFileURL(target).href;
  return import(moduleUrl);
};

const getDefaultDistDir = (cwd) => {
  const packageDist = path.resolve(cwd, "packages/arcade-ts/dist");
  return packageDist;
};

const maybeReadBaseline = async (baselinePath) => {
  if (!baselinePath) return undefined;
  try {
    const content = await fs.readFile(baselinePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return undefined;
  }
};

const main = async () => {
  const cwd = process.cwd();
  const projectId = process.env.BENCH_PROJECT_ID || DEFAULT_PROJECT_ID;
  const collectionAddress =
    process.env.BENCH_COLLECTION_ADDRESS || DEFAULT_COLLECTION;
  const warmup = toPositiveInt(process.env.BENCH_WARMUP, 3);
  const iterations = toPositiveInt(process.env.BENCH_ITERATIONS, 10);
  const operationTimeoutMs = toPositiveInt(
    process.env.BENCH_OPERATION_TIMEOUT_MS,
    15000,
  );
  const includeOptionalOps = toBoolean(
    process.env.BENCH_INCLUDE_OPTIONAL_OPS,
    false,
  );
  const failOnOperationError = toBoolean(
    process.env.BENCH_FAIL_ON_OPERATION_ERROR,
    false,
  );
  const tokenLimit = toPositiveInt(process.env.BENCH_TOKEN_LIMIT, 100);
  const orderLimit = toPositiveInt(process.env.BENCH_ORDER_LIMIT, 100);
  const listingLimit = toPositiveInt(process.env.BENCH_LISTING_LIMIT, 100);
  const distDir =
    process.env.BENCH_ARCADE_DIST_DIR || getDefaultDistDir(cwd);
  const outputFile = path.resolve(
    process.env.BENCH_OUTPUT_FILE || ".artifacts/sql-benchmark/head.json",
  );
  const markdownFile = path.resolve(
    process.env.BENCH_MARKDOWN_FILE || ".artifacts/sql-benchmark/head.md",
  );
  const baselineFile = process.env.BENCH_BASELINE_FILE
    ? path.resolve(process.env.BENCH_BASELINE_FILE)
    : undefined;

  const attributeFilters = parseAttributeFilters(
    process.env.BENCH_ATTRIBUTE_FILTERS_JSON || DEFAULT_ATTRIBUTE_FILTERS_JSON,
  );
  const traitName = process.env.BENCH_TRAIT_NAME || "beast id";

  const marketplace = await loadMarketplaceModule(distDir);

  const {
    createMarketplaceClient,
    fetchCollectionTraitMetadata,
    fetchTraitValues,
    runBenchmarkOperation,
    compareBenchmarkReports,
    renderBenchmarkMarkdown,
  } = marketplace;

  if (!createMarketplaceClient) {
    throw new Error("createMarketplaceClient export was not found");
  }
  if (!runBenchmarkOperation) {
    throw new Error("runBenchmarkOperation export was not found");
  }

  const client = await createMarketplaceClient({
    chainId: constants.StarknetChainId.SN_MAIN,
    defaultProject: projectId,
    runtime: "edge",
  });

  const operationResults = [];
  const operationFailures = [];

  const ensureTokenPageResult = async (resultPromise) => {
    const result = await resultPromise;
    const maybeError = result?.error?.error ?? result?.error;
    if (maybeError) {
      throw maybeError instanceof Error
        ? maybeError
        : new Error(String(maybeError));
    }
    return result;
  };

  const ensurePageErrorsEmpty = async (resultPromise) => {
    const result = await resultPromise;
    const maybeError = result?.errors?.[0]?.error ?? result?.errors?.[0];
    if (maybeError) {
      throw maybeError instanceof Error
        ? maybeError
        : new Error(String(maybeError));
    }
    return result;
  };

  const runAndRecord = async (name, execute) => {
    const outcome = await runBenchmarkOperation({
      name,
      warmup,
      iterations,
      timeoutMs: operationTimeoutMs,
      execute,
      now: () => performance.now(),
    });

    if (outcome.result) {
      operationResults.push(outcome.result);
      return outcome.lastResult;
    }

    if (outcome.failure) {
      operationFailures.push(outcome.failure);
      console.warn(`[benchmark] operation failed: ${name}`);
      console.warn(`[benchmark] reason: ${outcome.failure.error}`);
      if (failOnOperationError) {
        throw new Error(`[${name}] ${outcome.failure.error}`);
      }
    }

    return undefined;
  };

  if (includeOptionalOps) {
    await runAndRecord("getCollection", async () =>
      client.getCollection({
        projectId,
        address: collectionAddress,
        fetchImages: false,
      }),
    );
  }

  const firstPageResult = await runAndRecord(
    "listCollectionTokens:first-page",
    async () =>
      ensureTokenPageResult(
        client.listCollectionTokens({
          address: collectionAddress,
          project: projectId,
          limit: tokenLimit,
          fetchImages: false,
        }),
      ),
  );

  const seedCursor = firstPageResult?.page?.nextCursor;
  if (seedCursor) {
    await runAndRecord("listCollectionTokens:next-page", async () =>
      ensureTokenPageResult(
        client.listCollectionTokens({
          address: collectionAddress,
          project: projectId,
          cursor: seedCursor,
          limit: tokenLimit,
          fetchImages: false,
        }),
      ),
    );
  }

  if (attributeFilters) {
    await runAndRecord("listCollectionTokens:attribute-filters", async () =>
      ensureTokenPageResult(
        client.listCollectionTokens({
          address: collectionAddress,
          project: projectId,
          limit: tokenLimit,
          attributeFilters,
          fetchImages: false,
        }),
      ),
    );
  }

  await runAndRecord("getCollectionOrders", async () =>
    client.getCollectionOrders({
      collection: collectionAddress,
      limit: orderLimit,
    }),
  );

  await runAndRecord("listCollectionListings:verifyOwnership=false", async () =>
    client.listCollectionListings({
      collection: collectionAddress,
      limit: listingLimit,
      verifyOwnership: false,
      projectId,
    }),
  );

  if (includeOptionalOps) {
    await runAndRecord("listCollectionListings:verifyOwnership=true", async () =>
      client.listCollectionListings({
        collection: collectionAddress,
        limit: listingLimit,
        verifyOwnership: true,
        projectId,
      }),
    );
  }

  if (includeOptionalOps && fetchCollectionTraitMetadata) {
    await runAndRecord("fetchCollectionTraitMetadata", async () =>
      ensurePageErrorsEmpty(
        fetchCollectionTraitMetadata({
          address: collectionAddress,
          projects: [projectId],
        }),
      ),
    );
  }

  if (fetchTraitValues && traitName) {
    await runAndRecord(`fetchTraitValues:${traitName}`, async () =>
      ensurePageErrorsEmpty(
        fetchTraitValues({
          address: collectionAddress,
          traitName,
          projects: [projectId],
        }),
      ),
    );
  }

  if (operationResults.length === 0) {
    throw new Error("No successful benchmark operations completed");
  }

  const report = {
    generatedAt: new Date().toISOString(),
    projectId,
    collectionAddress,
    warmup,
    iterations,
    operations: operationResults,
    ...(operationFailures.length > 0 ? { failures: operationFailures } : {}),
  };

  const baseline = await maybeReadBaseline(baselineFile);
  const comparison =
    baseline && compareBenchmarkReports
      ? compareBenchmarkReports(baseline, report)
      : [];

  const markdown = renderBenchmarkMarkdown(report, comparison);

  await ensureDir(outputFile);
  await ensureDir(markdownFile);
  await fs.writeFile(outputFile, JSON.stringify(report, null, 2), "utf-8");
  await fs.writeFile(markdownFile, markdown, "utf-8");

  console.log(`Benchmark output written to ${outputFile}`);
  console.log(`Benchmark markdown written to ${markdownFile}`);
  console.log(markdown);
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`SQL benchmark failed: ${message}`);
    process.exit(1);
  });
