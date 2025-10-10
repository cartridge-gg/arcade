# Feature Feature Development Guide

This guide captures the current patterns used under `src/features` so new feature work can happen quickly and consistently.

## Architectural Overview
- **View models own orchestration.** `use<Feature>ViewModel` hooks gather data from hooks/services, derive display-friendly structures, and expose event callbacks.
- **Containers wire data to presentation.** `<Feature>Container.tsx` calls the view model hook and renders the corresponding UI component(s) from `src/components`.
- **Views stay dumb.** Components under `src/components` receive only the view model props and never pull data themselves. This separation keeps rendering logic reusable.

## Directory Convention
```
src/features/<feature>/
 ├─ <Feature>Container.tsx          // Feature entry-point component
 ├─ use<Feature>ViewModel.ts        // Primary view model hook
 ├─ use<Additional>ViewModel.ts     // Optional supporting hooks
 ├─ *.test.ts                       // Unit tests per view model hook
 └─ index.ts                        // Re-exports for consumers
```

## Implementation Steps
1. **Define the view contract.**  
   - Declare a `FooViewModel` TypeScript interface describing the props the UI needs.  
   - Prefer `return { … } satisfies FooViewModel;` to guarantee the shape is complete.

2. **Implement the view model hook.**  
   - Pull raw data via existing hooks (e.g. `useArcade`, `useAccount`).  
   - Use `useMemo`, `useCallback`, and `useState` to derive stable values and handlers.  
   - Avoid leaking domain objects directly—transform them into presentation-friendly structures inside the hook.

3. **Create the container.**  
   - Call the hook, optionally splitting responsibility between multiple view models.  
   - Pass the hook output into the UI component(s). Keep the container free of JSX branching that belongs in components.

4. **Export the feature.**  
   - Update `index.ts` to re-export the container and any hooks needed elsewhere.  
   - If the feature registers routes or providers, expose entry points from the same index.

5. **Add tests.**  
   - Co-locate `use<Feature>ViewModel.test.ts`.  
   - Use `@testing-library/react`’s `renderHook` and Vitest mocks for dependent hooks.  
   - Focus on verifying derived values, statuses, and callback behaviours.

## Example Skeleton

```tsx title="src/features/example/ExampleContainer.tsx"
import { ExampleView } from "@/components/ui/example/ExampleView";
import { useExampleViewModel } from "./useExampleViewModel";

export const ExampleContainer = () => {
  const viewModel = useExampleViewModel();

  return <ExampleView {...viewModel} />;
};
```

```ts title="src/features/example/useExampleViewModel.ts"
import { useMemo } from "react";
import { useArcade } from "@/hooks/arcade";

export interface ExampleViewModel {
  title: string;
  items: Array<{ id: string; label: string }>;
}

export function useExampleViewModel(): ExampleViewModel {
  const { games } = useArcade();

  const items = useMemo(
    () =>
      games.map((game) => ({
        id: game.id.toString(),
        label: game.name,
      })),
    [games],
  );

  return {
    title: "Example Feature",
    items,
  } satisfies ExampleViewModel;
}
```

```ts title="src/features/example/useExampleViewModel.test.ts"
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useExampleViewModel } from "./useExampleViewModel";

const mockUseArcade = vi.fn();
vi.mock("@/hooks/arcade", () => ({ useArcade: () => mockUseArcade() }));

describe("useExampleViewModel", () => {
  it("maps games into view items", () => {
    mockUseArcade.mockReturnValue({
      games: [{ id: 1, name: "Sample Game" }],
    });
    const { result } = renderHook(() => useExampleViewModel());
    expect(result.current.items).toEqual([{ id: "1", label: "Sample Game" }]);
  });
});
```

## Best Practices Checklist
- Keep business logic inside the hook; avoid duplicating it across components.
- Memoize heavy computations and derived arrays to reduce render churn.
- Prefer pure functions for data transformations; extract helpers when logic grows.
- Handle loading/error/empty states in the view model so the container stays slim.
- When interacting with analytics or side effects, isolate them in callbacks returned by the hook.
- Add tests for every public hook to prevent regressions and document behaviour.
