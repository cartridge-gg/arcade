# SQL Edge Optimization PRD (TDD)

## Document Control

- Status: Draft
- Owner: `packages/arcade-ts` maintainers
- Last updated: 2026-02-22
- Priority: P0 (package consumers depending on SQL path)

## Objective

Optimize the SQL marketplace path in `packages/arcade-ts` for reliability and latency at large-collection scale.

Primary target:
- `packages/arcade-ts/src/marketplace/client.edge.ts`
- `packages/arcade-ts/src/marketplace/filters.ts`

Non-primary target:
- benchmark tooling and CI gating for SQL regressions

This PRD is SQL-first by design. UI/runtime changes outside the package are out of scope except where needed to validate package behavior.

## Why This Matters

Integrators using the SQL runtime need predictable collection-page performance on high-cardinality collections and large orderbooks.

Observed production-like dataset characteristics (`arcade-main`):
- Beasts collection `0x046da895...5cf0e4`: `79,120` tokens
- Comparator collection `0x027838de...ad10e2d`: `1,121` tokens
- Beasts orders in `"ARCADE-Order"`: `5,832` total, `3,328` active sell listings
- Comparator orders: `0`

Observed package-level pain points:
- `getCollection` can return `400 Bad Request` for Beasts in SQL path.
- trait aggregation queries can stall/time out in large datasets.
- large `IN (...)` lists and ownership verification queries can inflate query/parse cost.
- token ID normalization is inconsistent across hex formats, creating correctness risk in SQL filtering.

## Problem Statement

The current SQL path is partially optimized (keyset token paging and SQL-side attribute filtering are present), but still has four unresolved risk areas:

1. Reliability: collection summary query can fail for valid collections.
2. Correctness: token ID normalization is not canonical across input forms.
3. Performance: trait metadata/summary queries are full-scan oriented and unbounded.
4. Scalability: large `IN` predicates for token and ownership filtering are fragile at high cardinality.

## Goals

1. Eliminate known SQL correctness failures in edge marketplace client.
2. Reduce tail latency for high-volume collection operations.
3. Keep API compatibility for existing package consumers.
4. Add benchmark-based CI guardrails for SQL regressions.

## Non-Goals

- Rewriting non-SQL runtime paths.
- Contract/schema migrations managed outside this repository.
- Frontend UX redesign.

## In Scope

- SQL generation and execution logic in edge marketplace client.
- SQL trait metadata query shapes.
- token ID canonicalization helpers used by SQL path.
- benchmark scenario coverage and CI budgets for SQL operations.

## Baseline Operations to Protect

Core operations:
- `listCollectionTokens:first-page`
- `listCollectionTokens:next-page`
- `listCollectionTokens:attribute-filters`
- `getCollectionOrders`
- `listCollectionListings:verifyOwnership=false`
- `fetchTraitValues:<trait>`

Optional/heavy operations (tracked separately):
- `getCollection`
- `listCollectionListings:verifyOwnership=true`
- `fetchCollectionTraitMetadata`

## Functional Requirements

### FR-1: `getCollection` reliability
- SQL query must return a valid collection summary or `null` without throwing for known-good addresses.
- No `400` failures for Beasts benchmark collection.

### FR-2: Canonical token ID behavior
- SQL token filtering must accept decimal, `0x`-prefixed hex, and bare-hex token IDs consistently.
- `tokenIds` filtering must behave identically for equivalent numeric IDs across formats.

### FR-3: Trait query performance shape
- Replace prefix-scan-only query shapes (`token_id LIKE '<address>:%'`) with collection-token join strategy where feasible.
- keep semantic parity for existing trait APIs.

### FR-4: Large list resilience
- token ID and ownership checks must avoid pathological single-query `IN (...)` expansion.
- apply chunking or CTE/value-table strategy with deterministic merge.

### FR-5: Benchmark gates
- SQL benchmark CI must cover the above operations for the target large collection and compare base vs head.
- regressions over defined thresholds must be visible and optionally fail CI.

## Performance Targets (Initial)

Targets are relative to benchmark baseline in CI (network variance aware):

1. No regression > 10% p95 in core operations for head vs base.
2. `getCollectionOrders` on Beasts: target 20% p50 improvement from current baseline.
3. `getCollection`: success rate 100% for benchmark collection.
4. trait summary/metadata operations: timeout-bounded and reported; no hanging runs.

## TDD Delivery Plan

### Epic A: Correctness and Reliability Hardening

#### A1. Fix `getCollection` query robustness

RED (tests first):
- Add `client.edge.test.ts` case where `token_contracts` row lacks metadata/token sample and fallback path still returns collection.
- Add case where first query fails; method returns `null` (or typed error contract if chosen) without unhandled throw.

GREEN:
- Rewrite `getCollection` to avoid correlated subqueries in `COALESCE`.
- Use deterministic two-step read:
  1. contract row by `contract_address`
  2. optional token sample lookup only when needed

REFACTOR:
- isolate SQL builders for collection summary query pieces.

#### A2. Canonical token ID normalization

RED:
- Add tests asserting `tokenIds: ["ff"]`, `["0xff"]`, and decimal equivalent resolve to same SQL predicate values.
- Add tests around mixed input deduplication.

GREEN:
- add canonical token-id parser helper used by SQL edge path.
- update `normalizeTokenIds` and related query token helpers.

REFACTOR:
- centralize token-id normalization in one utility and reuse across SQL methods.

### Epic B: Trait Query Optimization

#### B1. Query shape improvements for trait summary/metadata

RED:
- Extend `filters.test.ts` assertions to verify new query shape uses `tokens`-scoped join for collection filtering.
- Ensure semantic tests for OR-within-trait and AND-across-traits still pass.

GREEN:
- replace `token_id LIKE '<address>:%'` centered scans with collection token join CTE pattern where feasible.
- preserve outputs for:
  - `fetchTraitNamesSummary`
  - `fetchTraitValues`
  - `fetchCollectionTraitMetadata`
  - `fetchExpandedTraitsMetadata`

REFACTOR:
- extract shared CTE builders to reduce duplicated SQL templates.

#### B2. Timeout-aware heavy operations

RED:
- add benchmark/unit coverage proving heavy operations report timeout/failure deterministically.

GREEN:
- keep operation-level timeout handling in benchmark harness.
- expose clear failure reporting in markdown/json artifacts.

REFACTOR:
- normalize error payload shape for benchmark reports.

### Epic C: Large Predicate Resilience

#### C1. Large `tokenIds` query strategy

RED:
- add tests asserting large token ID inputs avoid one unbounded `IN (...)` string.
- assert deterministic ordering and pagination behavior preserved.

GREEN:
- implement chunking or CTE value-table strategy for large token lists.

REFACTOR:
- encapsulate chunk/merge behavior with focused helper tests.

#### C2. Ownership verification scaling

RED:
- add tests for large owner/token sets to ensure query builder chunks and merges without data loss.

GREEN:
- chunk ownership verification queries in `verifyListingsOwnership`.

REFACTOR:
- reuse shared chunk utility for owners/tokenIds.

### Epic D: Benchmark and CI Gates

RED:
- add benchmark test coverage for comparison rows and failure sections (already partially present).

GREEN:
- keep SQL benchmark workflow as required gate for marketplace SQL changes.
- include Beasts defaults:
  - project: `arcade-main`
  - collection: `0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4`

REFACTOR:
- simplify benchmark operation registry and per-operation configuration.

## Test Plan

Target test files:
- `packages/arcade-ts/src/marketplace/client.edge.test.ts`
- `packages/arcade-ts/src/marketplace/filters.test.ts`
- `packages/arcade-ts/src/marketplace/benchmark.test.ts`

Execution gates:

```bash
pnpm -C packages/arcade-ts test -- src/marketplace/client.edge.test.ts
pnpm -C packages/arcade-ts test -- src/marketplace/filters.test.ts
pnpm -C packages/arcade-ts test -- src/marketplace/benchmark.test.ts
pnpm -C packages/arcade-ts test
```

Benchmark validation:

```bash
pnpm --filter @cartridge/arcade build
BENCH_WARMUP=1 BENCH_ITERATIONS=5 node packages/arcade-ts/scripts/sql-benchmark.mjs
```

## Risks and Mitigations

1. Query planner behavior differs by backend version.
- Mitigation: benchmark base vs head in CI with same backend target.

2. Token ID format ambiguity across consumers.
- Mitigation: canonical normalization plus format-coverage tests.

3. Trait query semantics regression while changing SQL shape.
- Mitigation: preserve existing result-shape tests and add cross-query parity fixtures.

4. Network variance causing noisy benchmark deltas.
- Mitigation: use multiple iterations, report p50/p95, keep thresholds conservative.

## Rollout

1. Ship Epic A (correctness) first.
2. Ship Epic B (trait query shape) second.
3. Ship Epic C (large list resilience) third.
4. Enforce Epic D CI thresholds after baseline stabilizes.

## Definition of Done

- All new RED tests introduced per epic are observed failing before implementation and green after.
- SQL benchmark workflow produces stable artifacts and markdown summary.
- Core SQL operations have no >10% p95 regression vs base on PR benchmark.
- `getCollection` succeeds for benchmark collection.
- token ID normalization tests pass for hex/decimal mixed inputs.
