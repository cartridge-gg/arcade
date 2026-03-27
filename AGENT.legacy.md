# AGENT.md - Arcade Development Guide

## Project Architecture

### Monorepo Structure
- **Package Manager**: pnpm 10.5.2
- **Build Orchestration**: Turbo
- **Workspaces**: `client/`, `packages/*`, `contracts/`

### Package Overview

| Package | Type | Description |
|---------|------|-------------|
| `@cartridge/client` | React App | Frontend marketplace |
| `@cartridge/arcade` | SDK | TypeScript SDK (packages/arcade-ts) |
| `@cartridge/models` | Types | Generated Dojo models |
| `contracts/` | Cairo | Main smart contracts |
| `packages/achievement/` | Cairo | Achievement system |
| `packages/collection/` | Cairo | NFT collections |
| `packages/controller/` | Cairo | Account abstraction |
| `packages/orderbook/` | Cairo | Marketplace orderbook |
| `packages/registry/` | Cairo | Game registry |
| `packages/social/` | Cairo | Guilds, alliances |
| `packages/leaderboard/` | Cairo | Leaderboard system |
| `packages/quest/` | Cairo | Quest system |

### Dependencies
```
client/ → @cartridge/arcade (workspace)
       → @dojoengine/*, starknet, @cartridge/ui

packages/arcade-ts/ → @dojoengine/sdk, starknet
```

## Tech Stack

### Frontend (client/)
- React 19 + TypeScript + Vite
- Zustand (state), TanStack Router
- @cartridge/ui components
- @tanstack/react-virtual

### SDK (packages/arcade-ts/)
- tsup (ESM/CJS/IIFE)
- DojoEngine SDK, starknet.js

### Smart Contracts
- Cairo 2.13.1, Dojo 1.8.0
- Scarb 2.13.1

## Development Commands

```bash
# Development
pnpm dev              # Watch mode (all packages)

# Build
pnpm build            # Build all
pnpm build:scarb      # Cairo contracts only

# Testing
pnpm test             # All tests
pnpm test:ts          # TypeScript only
pnpm test:cairo       # Cairo only
pnpm test:watch       # Watch mode

# Linting & Formatting
pnpm lint             # Fix issues
pnpm lint:check       # Check only (CI)
pnpm format           # Fix formatting
pnpm format:check     # Check only (CI)

# Type Checking
pnpm type:check       # TypeScript
```

## Code Patterns

### ViewModel Pattern (client/src/features/)
```
features/{name}/
├── index.ts                    # Exports
├── use{Name}ViewModel.ts       # Business logic hook
└── use{Name}ViewModel.test.ts  # Tests
```

**Hook Structure:**
```typescript
export interface DashboardViewModel {
  items: Item[];
  isLoading: boolean;
}

export function useDashboardViewModel(): DashboardViewModel {
  // useMemo for computed values
  // Return interface-typed object
}
```

### Hooks Organization (client/src/hooks/)
- `arcade.ts` - SDK context
- `marketplace.ts` - Marketplace state
- `*-fetcher.ts` - Data fetching

### Cairo Component Pattern
```cairo
#[starknet::component]
mod BuyableComponent {
    #[storage]
    struct Storage { ... }

    #[embeddable_as(BuyableImpl)]
    impl Buyable<TContractState, +HasComponent<TContractState>> {
        fn buy(ref self: ComponentState<TContractState>) { ... }
    }
}
```

## Testing

### TypeScript (Vitest)
- Client: jsdom environment
- SDK: node environment
- Integration tests: `RUN_INTEGRATION_TESTS=true`

```typescript
describe("useFeatureViewModel", () => {
  it("returns expected state", () => {
    const { result } = renderHook(() => useFeatureViewModel());
    expect(result.current.isLoading).toBe(true);
  });
});
```

### Cairo
```cairo
#[test]
fn test_feature() {
    let world = spawn_test_world!(...);
    // Execute and assert
}
```

## Commit Standards

Format: `type(scope): description`

**Types:** feat, fix, refactor, test, docs, chore, style

**Scopes:** client, arcade-ts, contracts, marketplace, registry, social

**Examples:**
```
feat(marketplace): add metadata filtering
fix(client): resolve token display bug
refactor(arcade-ts): simplify torii client
```

## CI/CD

### TypeScript Pipeline
1. Format check → `pnpm format:check:ts`
2. Lint check → `pnpm lint:check:ts`
3. Build + Test

### Cairo Pipeline
Triggers on `*.cairo`, `Scarb.*` changes:
1. Format check → `scarb fmt --check`
2. Lint check
3. Build + Test → `scarb build && scarb test`

## File Naming

### TypeScript
- Components: `PascalCase.tsx`
- Hooks: `use{Name}.ts`
- Tests: `*.test.ts`

### Cairo
- Modules: `snake_case.cairo`
- Interfaces: `interface.cairo`
