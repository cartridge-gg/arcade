# Collection Fetch SQL Performance PRD (TDD)

## Context

Large collections are slow to load through the edge SQL marketplace client in `packages/arcade-ts`. Profiling and code review identified scaling bottlenecks in token pagination, attribute filtering, and listing retrieval.

## Problem Statement

Collection fetch latency grows superlinearly with collection size in the edge SQL path because:

- token pagination uses `OFFSET`, which degrades at deep pages;
- attribute filtering is applied client-side after token rows are fetched;
- listing queries are uncapped by default when `limit` is omitted.

## Goals

1. Make token page cost stable as collection size grows.
2. Reduce transferred/parsed rows when trait filters are active.
3. Prevent accidental full-table listing reads from default call sites.
4. Preserve existing external API shapes (`FetchCollectionTokensResult`, `CollectionListingsOptions`) and compatibility for existing numeric cursors.

## Non-Goals

- Rewriting the Dojo runtime path.
- Changing trait aggregation APIs in `filters.ts`.
- Introducing backend schema/index migrations in this PR.

## Success Metrics

1. `listCollectionTokens` no longer emits `OFFSET` for default pagination path.
2. `listCollectionTokens` produces keyset cursors and accepts keyset cursors.
3. `attributeFilters` are pushed into SQL query generation.
4. `listCollectionListings` applies a default `LIMIT` when caller omits one.
5. Existing marketplace edge tests continue to pass.

## Constraints

- Keep behavior deterministic for consumers already storing numeric cursors.
- Keep SQL injection protections through existing escaping helpers.
- Keep implementation minimal and test-driven.

## Proposed Solution

### 1) Token Keyset Pagination

- Replace offset paging with keyset paging for new cursors:
  - sort remains `ORDER BY token_id`;
  - add `token_id > :lastTokenId` when keyset cursor is present;
  - derive `nextCursor` from the last row token id if page is full.
- Maintain backward compatibility:
  - if cursor is numeric, continue to honor offset behavior.

### 2) SQL-Level Attribute Filtering

- Convert `attributeFilters` into SQL clauses against `token_attributes`:
  - `(trait_name = 'X' AND trait_value IN (...))` grouped with `OR`;
  - constrained to collection prefix (`token_id LIKE '<collection>:%'`);
  - `HAVING COUNT(DISTINCT trait_name) = <distinct traits>` to enforce AND semantics across traits.
- Keep existing value escaping.

### 3) Safe Default for Listing Query

- In `getCollectionOrders`, apply `DEFAULT_LIMIT` when `options.limit` is not provided.
- Preserve explicit `limit` override behavior.

## TDD Plan (Red-Green-Refactor)

### Test Set A: Keyset Pagination

RED:
- Add test asserting first token-page SQL does not include `OFFSET`.
- Add test asserting `nextCursor` is keyset-form and based on last token id.
- Add test asserting keyset cursor injects `token_id > ...`.

GREEN:
- Introduce cursor parsing/encoding helpers.
- Update SQL builder in `listCollectionTokens`.

### Test Set B: SQL Attribute Filters

RED:
- Add test asserting generated SQL includes `token_attributes` subquery and `HAVING COUNT(DISTINCT trait_name)`.

GREEN:
- Implement SQL trait filter clause builder.
- Remove client-side post-filter step from `listCollectionTokens`.

### Test Set C: Listing Default Limit

RED:
- Add test asserting `getCollectionOrders` includes `LIMIT <DEFAULT_LIMIT>` when no limit is supplied.

GREEN:
- Apply default limit in query generation.

### Refactor

- Keep helper boundaries small (`cursor` and `attributeFilters` SQL builders).
- Preserve existing exported API signatures.

## Risks and Mitigations

1. Lexicographic vs numeric token ordering
- Risk: keyset comparison over string token IDs can differ from numeric order.
- Mitigation: keep existing `ORDER BY token_id` semantics; keyset is aligned with current sort behavior.

2. Cursor compatibility
- Risk: existing persisted numeric cursor values.
- Mitigation: support both numeric and keyset cursor formats.

3. Query complexity
- Risk: trait subquery can still be expensive at extreme scale.
- Mitigation: pushes filtering server-side to reduce client over-fetch immediately; index tuning can be separate follow-up.

## Acceptance Criteria

- New tests for A/B/C are present and pass.
- Existing `client.edge.test.ts` scenarios remain green.
- Package tests pass for `packages/arcade-ts`.
- No public API/type breaking change.

## Validation Commands

```bash
pnpm -C packages/arcade-ts test -- src/marketplace/client.edge.test.ts
pnpm -C packages/arcade-ts test
```
