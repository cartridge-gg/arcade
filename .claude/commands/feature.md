---
description: Develop new features following project patterns
---

Develop features following the ViewModel pattern:

1. **Feature structure**
   Create in `client/src/features/{name}/`:
   ```
   features/{name}/
   ├── {Name}Container.tsx    # Container component
   ├── use{Name}ViewModel.ts  # Business logic hook
   ├── use{Name}ViewModel.test.ts
   └── index.ts               # Public exports
   ```

2. **ViewModel hook pattern**
   ```typescript
   interface {Name}ViewModel {
     // State
     isLoading: boolean;
     data: DataType | null;
     error: Error | null;
     // Actions
     onAction: () => void;
   }

   export function use{Name}ViewModel(): {Name}ViewModel {
     // Implementation
   }
   ```

3. **Container component**
   ```typescript
   import { use{Name}ViewModel } from "./use{Name}ViewModel";

   export function {Name}Container() {
     const vm = use{Name}ViewModel();
     // Render using vm properties
   }
   ```

4. **State management**
   - Zustand for global state
   - URL params for shareable state (filters, pagination)
   - React state for local UI state

5. **UI components**
   - Use `@cartridge/ui` components
   - Keep presentational components in `components/ui/`
   - Reuse existing modules from `components/ui/modules/`

6. **Performance patterns**
   - `useMemo` for expensive computations
   - `useCallback` for stable function references
   - Virtual scrolling for large lists (`@tanstack/react-virtual`)

7. **Testing**
   ```typescript
   import { renderHook } from "@testing-library/react";
   import { describe, it, expect } from "vitest";

   describe("use{Name}ViewModel", () => {
     it("returns expected initial state", () => {
       const { result } = renderHook(() => use{Name}ViewModel());
       expect(result.current.isLoading).toBe(true);
     });
   });
   ```

8. **Pre-commit checklist**
   ```bash
   pnpm format:check && pnpm lint:check && pnpm type:check && pnpm build && pnpm test
   ```
