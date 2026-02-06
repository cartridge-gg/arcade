# Claude Code Context - Arcade Project

## Project Overview
NFT marketplace application with collection browsing and filtering capabilities.

## Current Feature: NFT Metadata Filtering
Implementing metadata-based filtering for NFT collections to help users find tokens by traits.

### Tech Stack
- **Frontend**: React 18, TypeScript
- **State**: Zustand
- **UI**: @cartridge/ui components
- **Routing**: React Router v6
- **Performance**: @tanstack/react-virtual

### Key Components & Patterns

#### Hooks
- `useMarketTokensFetcher`: Fetches NFT tokens with incremental loading
- `useMetadataFilters` (new): Manages metadata filtering logic
- Pattern: Custom hooks for business logic

#### State Management
- Zustand stores for global state
- URL params for shareable state
- Pattern: Separate stores by domain

#### Component Structure
- `client/src/components/items/index.tsx`: Main NFT display component
- `client/src/components/filters/index.tsx`: Filter UI (DO NOT MODIFY)
- Pattern: Container/presentational separation

### Implementation Guidelines

#### Metadata Processing
- Extract during token fetch in `batchProcessTokens`
- Build index incrementally as tokens load
- Schema: `{ [trait]: { [value]: [token_ids[]] } }`

#### Filter Logic
- AND between different traits
- OR within same trait values
- Persist state in URL params

#### Performance
- Virtual scrolling for large lists
- Memoize filter computations
- Batch state updates

### Recent Changes
1. ✅ Implemented metadata filtering for NFT collections
2. ✅ Created metadata indexer utilities with trait-value-tokenId mapping
3. ✅ Added Zustand store for filter state management
4. ✅ Built useMetadataFilters hook with URL persistence
5. ✅ Integrated filtering into marketplace-tokens-fetcher
6. ✅ Updated Items component with filter indicators
7. ✅ Added comprehensive test coverage including edge cases and performance tests

### Implementation Details

#### Metadata Indexing
- Builds index during token fetch in `batchProcessTokens`
- Schema: `{ [trait]: { [value]: [token_ids[]] } }`
- Handles edge cases: null metadata, special characters, duplicates

#### Filter Application
- AND logic between different traits
- OR logic within same trait values
- URL persistence format: `?filters=rarity:legendary,epic|background:gold`

#### Performance Optimizations
- Incremental index updates for streaming tokens
- Memoized filter calculations
- Virtual scrolling for large collections
- RequestIdleCallback for 1000+ tokens

### Testing Coverage
- Contract tests for all utilities and hooks
- Integration tests for filter scenarios
- Edge case tests for malformed data
- Performance tests for 10k+ tokens

### DO NOT
- Modify existing filter component (`client/src/components/filters/index.tsx`)
- Change core token fetching logic beyond metadata indexing
- Add unnecessary dependencies

### Next Steps
- Run tests: `pnpm test`
- Check performance: `pnpm test:performance`
- Deploy and monitor for production usage

## Available Skills
- `/review` - Code review for PRs or staged files
- `/cairo-check` - Cairo contract analysis and security
- `/ci-fix` - Diagnose and fix CI failures
- `/refactor` - Analyze code for refactoring opportunities
- `/test-gen` - Generate tests for source files
- `/create-pr` - Create PR with conventional commits
- `/update-pr` - Respond to PR feedback
- `/feature` - Develop new features following patterns