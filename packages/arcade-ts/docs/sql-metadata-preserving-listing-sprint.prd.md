# SQL Metadata-Preserving Listing Performance PRD (Sprint TDD)

## Document Control

- Status: Completed
- Owner: `packages/arcade-ts` maintainers
- Last updated: 2026-02-23
- Sprint window: current sprint (1 sprint)
- Priority: P0

## Objective

Reduce SQL token-list latency in `packages/arcade-ts` while preserving NFT visibility and metadata access.

Key principle for this sprint:
- metadata is required for full NFT UX,
- but metadata does not need to be eagerly fetched for every token card on first page load.

## Context and Baseline

Current benchmark (`.artifacts/sql-benchmark/head.json`, generated 2026-02-22):

- `listCollectionTokens:first-page`: p50 `1497.68ms`, p95 `1918.1ms`
- `listCollectionTokens:next-page`: p50 `1745.04ms`, p95 `2003.09ms`
- `listCollectionTokens:attribute-filters`: p50 `240.95ms`, p95 `251.43ms`

Direct SQL profiling against `arcade-main` Beasts collection showed payload dominance:

- with metadata (`LIMIT 100`): ~`3.25MB` response, ~`1.69s` avg
- without metadata (`LIMIT 100`): ~`16.9KB` response, ~`0.26s` avg

This indicates first-page latency is primarily response size + transfer + JSON parsing, not only predicate/index quality.

## Problem Statement

`listCollectionTokens` currently always selects `metadata` in the edge SQL path, which over-fetches for list/grid surfaces that only need:

- token identity (`contract_address`, `token_id`),
- image URL (derived from Torii static endpoint),
- optional lightweight labels.

We need a TDD-scoped path that:

1. keeps current default behavior safe for existing consumers,
2. enables deferred metadata loading for high-volume list views,
3. preserves eventual full metadata access without changing business semantics.

## Goals

1. Preserve existing default API behavior for backwards compatibility.
2. Introduce an opt-in deferred metadata mode for token listing.
3. Add explicit metadata hydration path for selected token IDs.
4. Add benchmark/CI coverage to prevent regressions and prove benefit.

## Non-Goals

- Removing metadata support.
- Rewriting Dojo runtime path.
- Contract/index migrations.
- Frontend redesign outside API integration examples.

## In Scope

- `packages/arcade-ts/src/marketplace/types.ts`
- `packages/arcade-ts/src/marketplace/client.edge.ts`
- `packages/arcade-ts/src/marketplace/index.ts`
- `packages/arcade-ts/src/marketplace/README.md`
- `packages/arcade-ts/scripts/sql-benchmark.mjs`
- `packages/arcade-ts/src/marketplace/client.edge.test.ts`
- `packages/arcade-ts/src/marketplace/benchmark.test.ts`

## Out of Scope

- Client app route-level virtualization work.
- Multi-project cache invalidation redesign.
- Marketplace schema changes.

## Functional Requirements

### FR-1: Backwards-compatible default

- `listCollectionTokens` behavior remains unchanged when no new option is provided.
- Existing callers continue receiving metadata as today.

### FR-2: Deferred metadata option

- Add an option on `FetchCollectionTokensOptions`:
  - `includeMetadata?: boolean` (default `true`).
- When `includeMetadata === false`, SQL projection must exclude metadata-heavy fields.
- Returned token objects must still include:
  - canonical `contract_address`,
  - `token_id`,
  - image URL resolution path (`fetchImages` behavior remains functional).

### FR-3: Batch metadata hydration

- Add a new client method for targeted hydration by token IDs for a collection:
  - `getCollectionTokenMetadataBatch(...)` (name finalization during implementation).
- It must support chunking for large token-id inputs and return normalized tokens with metadata.

### FR-4: Deterministic behavior and safety

- Existing token ID canonicalization and dedupe behavior must be reused.
- SQL generation remains escaped and chunked for large `IN` sets.

### FR-5: Benchmark visibility and gating

- Benchmark script must include both modes:
  - eager metadata list path,
  - deferred metadata list path.
- Markdown report must clearly separate these operations.
- CI should fail on deferred-mode regressions once baseline stabilizes.

## Success Metrics (Sprint Exit)

1. Deferred-mode benchmark target on Beasts (`LIMIT 100`):
- `listCollectionTokens:first-page:deferred` p50 <= `700ms`
- `listCollectionTokens:next-page:deferred` p50 <= `800ms`

2. No regression guardrails:
- Existing eager-mode ops do not regress > `10%` p95 vs base.

3. Correctness:
- 100% passing tests for new API behavior and compatibility.

4. UX compatibility:
- Deferred-mode tokens still produce image URLs when `fetchImages=true`.

## TDD Delivery Plan (RED/GREEN/REFACTOR)

### Epic A: Deferred Metadata Listing (P0)

#### A1. Add API surface [x]

RED:
- Add type-level and runtime tests asserting:
  - default call includes metadata projection,
  - `includeMetadata: false` excludes metadata projection.

GREEN:
- Introduce `includeMetadata?: boolean` in `FetchCollectionTokensOptions`.
- Keep default `true`.

REFACTOR:
- Extract SQL projection builder for token queries.

#### A2. Preserve image visibility in deferred mode [x]

RED:
- Add test proving returned tokens still include deterministic image URL when:
  - `includeMetadata=false`
  - `fetchImages=true`.

GREEN:
- Ensure normalization path tolerates absent metadata and still resolves image URL.

REFACTOR:
- Minimize branching in token normalization.

### Epic B: Metadata Hydration Batch API (P0)

#### B1. Add batch metadata fetch method [x]

RED:
- Add tests for new method:
  - hydrates metadata for requested token IDs,
  - returns empty for invalid token IDs,
  - chunks large token ID sets.

GREEN:
- Implement SQL query path scoped to collection + token IDs.
- Reuse `normalizeTokenIds` and chunk helpers.

REFACTOR:
- Reuse shared query builder utilities between list + hydrate methods.

#### B2. Edge cases and compatibility [x]

RED:
- Add tests for decimal/hex/bare-hex token ID equivalence in hydration path.

GREEN:
- Route hydration path through canonicalization utility.

REFACTOR:
- Consolidate token-id normalization entry points.

### Epic C: Benchmarks and CI Gates (P1)

#### C1. Benchmark operation expansion [x]

RED:
- Add benchmark helper/unit tests for additional operation names.

GREEN:
- Add operations:
  - `listCollectionTokens:first-page:eager`
  - `listCollectionTokens:first-page:deferred`
  - `listCollectionTokens:next-page:eager`
  - `listCollectionTokens:next-page:deferred`
  - optional: `getCollectionTokenMetadataBatch:100`

REFACTOR:
- Centralize operation registry in benchmark script.

#### C2. CI threshold enforcement [x]

RED:
- Add script/unit tests for threshold evaluation logic.

GREEN:
- Add fail condition for deferred-mode regressions above threshold.
- Keep optional heavy operations non-blocking for now.

REFACTOR:
- Separate core and optional comparison sets.

## Sprint Backlog and Estimates

1. [x] Story A: Deferred metadata option + SQL projection split
- Estimate: 2 days
- Owner: SDK engineer
- Risk: medium (API + normalization semantics)

2. [x] Story B: Batch metadata hydration API
- Estimate: 2 days
- Owner: SDK engineer
- Risk: medium (API shape + chunk behavior)

3. [x] Story C: Benchmark/CI expansion and gates
- Estimate: 1 day
- Owner: infra + SDK
- Risk: low/medium (flaky network variance)

4. [x] Story D: Docs and migration examples
- Estimate: 0.5 day
- Owner: SDK engineer
- Risk: low

Total: 5.5 engineering days (fits one sprint with review buffer).

## Test Plan

Primary files:

- `packages/arcade-ts/src/marketplace/client.edge.test.ts`
- `packages/arcade-ts/src/marketplace/benchmark.test.ts`
- optional new tests:
  - `packages/arcade-ts/src/marketplace/metadata-batch.test.ts`

Execution:

```bash
pnpm -C packages/arcade-ts test -- src/marketplace/client.edge.test.ts
pnpm -C packages/arcade-ts test -- src/marketplace/benchmark.test.ts
pnpm -C packages/arcade-ts test
```

Benchmark validation:

```bash
pnpm --filter @cartridge/arcade build
BENCH_WARMUP=1 BENCH_ITERATIONS=5 BENCH_INCLUDE_OPTIONAL_OPS=1 node packages/arcade-ts/scripts/sql-benchmark.mjs
```

## Rollout Plan

1. Land API + tests behind backward-compatible defaults.
2. Land hydration API + tests.
3. Land benchmark operation expansion and CI thresholds in warning mode.
4. Flip CI thresholds to blocking after 3-5 stable PR runs.

## Risks and Mitigations

1. Consumers rely on metadata in list call implicitly.
- Mitigation: default remains eager (`includeMetadata=true`), deferred is opt-in.

2. Deferred mode adopted without hydration strategy.
- Mitigation: provide batch hydration API and README usage pattern in same sprint.

3. Benchmark noise from network/backend variance.
- Mitigation: compare base/head in same workflow; use conservative p95 threshold.

## Definition of Done

- [x] New deferred metadata mode exists and is fully tested.
- [x] Batch metadata hydration method exists and is fully tested.
- [x] Benchmark reports include eager vs deferred operations.
- [x] CI can detect/flag deferred-mode regressions.
- [x] README documents when to use eager vs deferred mode and how to hydrate metadata.
