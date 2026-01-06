---
description: Generate tests for specified source files
---

Generate comprehensive tests for the target file(s):

1. **Parse target**
   - File path from $ARGUMENTS
   - Determine test type from extension

2. **TypeScript tests**

   For `use*ViewModel.ts`:
   ```typescript
   import { renderHook } from "@testing-library/react";
   import { describe, it, expect, vi } from "vitest";

   describe("useFeatureViewModel", () => {
     it("returns expected initial state", () => {
       const { result } = renderHook(() => useFeatureViewModel());
       expect(result.current.isLoading).toBe(true);
     });
   });
   ```

   For utilities:
   - Test each exported function
   - Cover edge cases and error conditions
   - Mock external dependencies

3. **Cairo tests**
   - Follow patterns in `contracts/src/tests/`
   - Use `spawn_test_world!` for setup
   - Test success and failure paths

4. **Test file location**
   - TS: `{filename}.test.ts` adjacent to source
   - Cairo: `tests/test_{module}.cairo`

5. **Read existing tests**
   - Check nearby test files for patterns
   - Match mocking strategies
   - Follow assertion styles

6. **Generate and verify**
   - Write test file
   - Run: `pnpm test --run {testfile}`
   - Report results

7. **Coverage targets**
   - Test return value shapes
   - Test state transitions
   - Test error conditions
   - Test edge cases
