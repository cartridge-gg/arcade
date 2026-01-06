---
description: Analyze code for refactoring opportunities
---

Analyze code for refactoring improvements:

1. **Parse target**
   - File/directory/pattern from $ARGUMENTS
   - If `--apply` flag present, will apply safe refactorings

2. **Analysis checklist**

   **Duplication:**
   - Find repeated code blocks (3+ lines similar)
   - Identify copy-paste patterns

   **Complexity:**
   - Functions > 30 lines
   - Deeply nested conditionals (3+ levels)
   - High cyclomatic complexity

   **Dependencies:**
   - Circular imports
   - Unused imports
   - Missing type imports

   **Patterns:**
   - Non-standard patterns vs project conventions
   - Missing ViewModel pattern in features/
   - Inconsistent hook naming

   **Performance:**
   - Missing memoization for expensive computations
   - Unnecessary re-renders
   - Large bundle imports

3. **For each finding**
   - Describe the issue
   - Propose solution with code example
   - Estimate effort: small/medium/large
   - List affected files

4. **Output format**
   ```
   ## Refactoring Analysis: {target}

   ### High Priority
   1. [file:line] {issue}
      - Problem: ...
      - Solution: ...
      - Effort: small

   ### Medium Priority
   ...
   ```

5. **If `--apply` flag**
   - Apply low-risk refactorings only
   - Run `pnpm lint && pnpm test` after
   - Report changes made
   - Do NOT commit
