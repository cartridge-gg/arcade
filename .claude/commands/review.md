---
description: Review code changes for a PR or staged files
---

Perform a comprehensive code review:

1. **Identify scope**
   - If PR number provided: `gh pr view $ARGUMENTS --json files,diff`
   - If no argument: review staged changes via `git diff --cached`
   - If unstaged: review `git diff`

2. **TypeScript/React checks**
   - ViewModel pattern: hooks return typed interfaces
   - Memoization: useMemo for expensive computations
   - Dependencies: correct useEffect/useMemo deps
   - Types: no untyped `any`, proper interfaces
   - Tests: new ViewModels have corresponding test files

3. **Cairo checks**
   - Component pattern: proper trait usage
   - Storage: efficient storage patterns
   - Events: appropriate event emissions
   - Errors: proper error handling

4. **Cross-cutting concerns**
   - Conventional commit format
   - No secrets or credentials
   - No console.log in production code
   - Import organization
   - Biome lint compliance

5. **Security review**
   - No exposed API keys
   - No hardcoded credentials
   - Proper input validation
   - Safe external data handling

6. **Output format**
   ```
   ## Review Summary

   ### Critical (must fix)
   - [file:line] Issue description

   ### Suggestions
   - [file:line] Improvement suggestion

   ### Positive
   - Good patterns observed
   ```

7. **Optional: Post review**
   If PR number and `--post` flag: `gh pr review $ARGUMENTS --comment --body "..."`
