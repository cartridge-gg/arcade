# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cartridge Arcade is a platform for building and distributing games on Starknet. It combines an NFT marketplace with achievements, player profiles, and social features. The project uses a monorepo structure with Cairo smart contracts (Dojo framework) and a React TypeScript frontend.

## Architecture

### Monorepo Structure
- **`client/`**: React + TypeScript frontend (main application)
- **`contracts/`**: Cairo smart contracts (Dojo systems)
- **`packages/`**: Shared Cairo packages and TypeScript SDK
  - `arcade-ts/`: Main SDK for interacting with Arcade contracts
  - `models/`: Cairo models and TypeScript bindings
  - `achievement/`, `collection/`, `marketplace/`, etc.: Cairo contract packages

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Smart Contracts**: Cairo 2.12, Dojo 1.7 framework
- **State Management**: Zustand stores, React Query (@tanstack/react-query)
- **UI**: @cartridge/ui components, Radix UI, TailwindCSS
- **Data Fetching**: Torii (Dojo's indexer) via WASM bindings
- **Build System**: Turborepo for monorepo orchestration, pnpm workspaces

### Key Architectural Patterns

#### Frontend Data Flow
1. **Collections**: Pre-loaded static data (games, editions, token contracts)
   - Located in `client/src/collections/`
   - Preloaded in `main.tsx` before app render
2. **Fetchers**: Custom hooks for paginated data streaming
   - Pattern: `use[Resource]Fetcher` (e.g., `useMarketTokensFetcher`)
   - Handle cursor-based pagination from Torii
   - Store results in Zustand stores
3. **Stores**: Zustand for client-side state
   - `store.ts`: Main marketplace collections and tokens
   - Separate stores per domain (collections, tokens, filters)
4. **Context Providers**: React context for cross-cutting concerns
   - Located in `client/src/context/`
   - Examples: arcade context, starknet context, theme

#### State Management Layers
- **URL State**: Router params for shareable state (filters, tabs)
- **Zustand**: Global client state (collections, tokens, loading states)
- **React Query**: Server state caching (achievements, metadata)
- **Local State**: Component-level state (forms, UI toggles)

#### Cairo Contract Architecture
The project uses Dojo's ECS (Entity Component System) architecture:
- **Systems**: Core logic in `contracts/src/systems/`
  - `registry.cairo`: Game/collection registration
  - `marketplace.cairo`: NFT trading
  - `social.cairo`: Player profiles and social features
  - `slot.cairo`: Achievement slots
  - `wallet.cairo`: Wallet management
- **Models**: Data structures in `packages/models/src/`
- **Namespace**: All contracts under `ARCADE` namespace

## Common Development Commands

### Building & Development
```bash
# Install dependencies
pnpm install

# Start development server (watches all packages)
pnpm dev

# Build everything (contracts + frontend)
pnpm build

# Build Cairo contracts only
pnpm build:scarb

# Build package dependencies
pnpm build:deps

# Type checking (persistent, watches changes)
pnpm type:check
```

### Testing & Quality
```bash
# Run all tests
pnpm test

# Watch mode for tests
pnpm test:watch

# Format code (Biome)
pnpm format
pnpm format:check

# Lint code
pnpm lint
pnpm lint:check
```

### Cairo/Dojo Specific
```bash
# Generate achievements from CSV
npx gen ./scripts/achievements.csv ./scripts/achievements.cairo

# Test specific Cairo package
cd packages/achievement && scarb test
```

### Client Development
```bash
cd client

# Dev server with hot reload
pnpm dev

# Build for production
pnpm build

# Type check only
pnpm type:check
```

## Important Patterns & Conventions

### Custom Hooks Pattern
Most data fetching uses custom hooks following this pattern:
```typescript
export function use[Resource]Fetcher({
  project,
  address,
  autoFetch = true,
  filters = {},
}) {
  // State management
  const [cursor, setCursor] = useState<string>();
  const isFetchingRef = useRef(false);

  // Zustand store actions
  const addData = useStore(state => state.addData);

  // Fetch implementation with pagination
  const fetchData = useCallback(async (currentCursor) => {
    // Fetch from Torii client
    // Process and store results
  }, [dependencies]);

  return {
    data,
    hasMore: Boolean(cursor),
    isFetchingNextPage,
    fetchNextPage,
  };
}
```

### Torii Queries
- Use `fetchToriis()` helper from `@cartridge/arcade`
- Always handle cursor-based pagination
- Process tokens/entities incrementally for performance
- Store checksummed addresses (`getChecksumAddress()`)

### Filter Implementation
- Filters stored in URL params for shareability
- Format: `?filters=trait:value1,value2|trait2:value3`
- AND logic between different traits
- OR logic within same trait values
- Use `useMetadataFilters` hook for filter state management

### Component Structure
- **Container components**: Handle data fetching and state
- **Presentational components**: Pure UI components
- **Hooks**: Business logic extraction
- Prefer composition over inheritance

### Cairo Development
- Models define data structures (in `packages/models/`)
- Systems implement game logic (in `contracts/src/systems/`)
- Use Dojo macros: `#[dojo::contract]`, `#[dojo::model]`
- Test coverage required for all systems

## GraphQL API

The Cartridge API is documented in `GRAPHQL_QUERIES.md`:
- Endpoint: `https://api.cartridge.gg/query`
- Key queries: player achievements, game achievements, account lookup
- Performance: Single game queries are fast (~200-500ms), multi-game queries can timeout

## Important Files

### Configuration
- `turbo.json`: Turborepo task orchestration and dependencies
- `pnpm-workspace.yaml`: Workspace package definitions and catalog versions
- `Scarb.toml`: Cairo workspace configuration, Dojo settings
- `dojo_mainnet.toml`: Mainnet deployment configuration (contains world address, RPC)
- `biome.json`: Code formatting and linting rules

### Entry Points
- `client/src/main.tsx`: Frontend application bootstrap
- `contracts/src/lib.cairo`: Cairo contracts entry point
- `packages/arcade-ts/src/index.ts`: SDK exports

### Key Hooks
- `useMarketTokensFetcher`: NFT token pagination with filters
- `useMetadataFilters`: Trait-based filtering with URL persistence
- `useMarketCollectionsFetcher`: Collection data fetching
- `useAnalytics`: PostHog analytics integration

## Deployment

- **Frontend**: Deployed via Vercel
  - SSR routes auto-configured via post-build script
  - OG image generation at `/api/og`
- **Contracts**: Deployed to Starknet via Dojo CLI
  - Mainnet world address in `dojo_mainnet.toml`
  - Use `sozo` CLI for contract deployments

## Performance Considerations

- Virtual scrolling (`@tanstack/react-virtual`) for large token lists
- Incremental metadata indexing during token fetches
- Memoize expensive computations (filter calculations)
- Use `requestIdleCallback` for non-critical work (>1000 tokens)
- Pre-load static collections before app render
- Cursor-based pagination to avoid loading all data upfront

## Development Workflow

1. **Feature branches**: Work on feature branches, PR to `main`
2. **Commit conventions**: Uses Conventional Commits (enforced via commitlint)
3. **Turborepo caching**: Tasks are cached based on inputs
4. **Dependency graph**: Build tasks respect package dependencies
   - `build:deps` must complete before `dev` can start
   - `build:scarb` generates TypeScript bindings for contracts
