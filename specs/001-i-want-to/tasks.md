# Tasks: NFT Metadata Filtering

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✓ Found: TypeScript/React 18, Zustand, @cartridge/ui
   → ✓ Structure: client/src/ directory
2. Load optional design documents:
   → data-model.md: MetadataIndex, FilterState, TokenMetadata → model tasks
   → contracts/: 3 files → contract test tasks
   → research.md: Zustand store, URL persistence → setup tasks
3. Generate tasks by category:
   → Setup: TypeScript types, store setup
   → Tests: contract tests, integration tests
   → Core: utilities, store, hook
   → Integration: component integration, URL sync
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → ✓ All contracts have tests
   → ✓ All entities have models
   → ✓ All components integrated
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **React App**: `client/src/` for source, `client/tests/` for tests
- All paths relative to repository root

## Phase 3.1: Setup
- [x] T001 Create TypeScript type definitions in client/src/types/metadata-filter.types.ts
- [x] T002 [P] Create test setup file in client/tests/setup/metadata-filter.setup.ts
- [x] T003 [P] Add metadata filter types to client/src/store/index.ts exports

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test for metadata indexer utilities in client/tests/utils/metadata-indexer.test.ts
- [x] T005 [P] Contract test for metadata filter store in client/tests/store/metadata-filters.test.ts
- [x] T006 [P] Contract test for useMetadataFilters hook in client/tests/hooks/use-metadata-filters.test.tsx
- [x] T007 [P] Integration test for single trait filtering in client/tests/integration/single-trait-filter.test.tsx
- [x] T008 [P] Integration test for multiple trait AND logic in client/tests/integration/multi-trait-filter.test.tsx
- [x] T009 [P] Integration test for URL persistence in client/tests/integration/url-persistence.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T010 [P] Implement metadata indexer utilities in client/src/utils/metadata-indexer.ts
- [x] T011 [P] Implement Zustand metadata filter store in client/src/store/metadata-filters.ts
- [x] T012 Implement useMetadataFilters hook in client/src/hooks/use-metadata-filters.ts
- [x] T013 Enhance marketplace-tokens-fetcher.ts to build metadata index during fetch
- [x] T014 Add URL state synchronization to useMetadataFilters hook

## Phase 3.4: Integration
- [x] T015 Integrate useMetadataFilters into client/src/components/items/index.tsx
- [x] T016 Connect filter component to metadata filters (without modifying filter component)
- [x] T017 Add metadata index building to token batch processing
- [x] T018 Implement filter count display in items component
- [x] T019 Add empty state handling for no matching tokens

## Phase 3.5: Polish
- [x] T020 [P] Unit tests for metadata extraction edge cases in client/tests/unit/metadata-edge-cases.test.ts
- [x] T021 [P] Performance test for 10k+ tokens in client/tests/performance/large-collection.test.ts
- [x] T022 [P] Add JSDoc documentation to all exported functions
- [x] T023 Optimize filter application with memoization
- [x] T024 Run quickstart validation scenarios
- [x] T025 Update CLAUDE.md with implementation details

## Dependencies
- Tests (T004-T009) must complete before implementation (T010-T014)
- T010 (indexer) blocks T011 (store) and T012 (hook)
- T012 (hook) blocks T015-T019 (integration)
- T013 (fetcher enhancement) blocks T017 (batch processing)
- All implementation before polish (T020-T025)

## Parallel Example
```bash
# Launch T004-T009 together (all test files):
Task: "Contract test for metadata indexer utilities in client/tests/utils/metadata-indexer.test.ts"
Task: "Contract test for metadata filter store in client/tests/store/metadata-filters.test.ts"
Task: "Contract test for useMetadataFilters hook in client/tests/hooks/use-metadata-filters.test.tsx"
Task: "Integration test for single trait filtering in client/tests/integration/single-trait-filter.test.tsx"
Task: "Integration test for multiple trait AND logic in client/tests/integration/multi-trait-filter.test.tsx"
Task: "Integration test for URL persistence in client/tests/integration/url-persistence.test.tsx"

# Launch T010-T011 together (different files):
Task: "Implement metadata indexer utilities in client/src/utils/metadata-indexer.ts"
Task: "Implement Zustand metadata filter store in client/src/store/metadata-filters.ts"

# Launch T020-T022 together (polish tasks):
Task: "Unit tests for metadata extraction edge cases in client/tests/unit/metadata-edge-cases.test.ts"
Task: "Performance test for 10k+ tokens in client/tests/performance/large-collection.test.ts"
Task: "Add JSDoc documentation to all exported functions"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task completion
- DO NOT modify client/src/components/filters/index.tsx
- DO NOT change core fetching logic, only enhance with metadata processing
- Use existing Zustand patterns from codebase
- Follow existing URL param patterns for filter persistence

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - metadata-filter-hook.ts → T006 test task [P]
   - metadata-filter-store.ts → T005 test task [P]
   - metadata-indexer.ts → T004 test task [P]

2. **From Data Model**:
   - MetadataIndex entity → T010 indexer implementation
   - FilterState entity → T011 store implementation
   - TokenMetadata entity → T013 fetcher enhancement

3. **From User Stories**:
   - Single trait filtering → T007 integration test [P]
   - Multiple trait AND → T008 integration test [P]
   - Clear filters → Part of T012 hook implementation
   - URL persistence → T009 integration test [P]

4. **Ordering**:
   - Setup → Tests → Utilities → Store → Hook → Integration → Polish
   - Dependencies prevent parallel where files are shared

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T004-T006)
- [x] All entities have implementation tasks (T010-T013)
- [x] All tests come before implementation (T004-T009 before T010-T019)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Constraints respected (no filter component modification)