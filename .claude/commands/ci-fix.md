---
description: Diagnose and fix CI pipeline failures
---

Troubleshoot CI failures for this repository:

1. **Get failure context**
   - If PR number provided: `gh pr checks $ARGUMENTS --json name,state,conclusion`
   - Get failed workflow logs: `gh run view --log-failed`
   - If no argument: check current branch CI status

2. **Diagnose by failure type**

   **Format failures:**
   - TypeScript: Run `pnpm format:ts` to auto-fix
   - Cairo: Run `scarb fmt` to auto-fix

   **Lint failures:**
   - TypeScript: Run `pnpm lint:ts` to auto-fix, report remaining issues
   - Cairo: Check error messages, suggest manual fixes

   **Build failures:**
   - Read error output carefully
   - Check for missing imports or type errors
   - Verify dependency versions

   **Test failures:**
   - Run failing tests locally: `pnpm test --run {testfile}`
   - Identify assertion mismatches
   - Check for environment differences

3. **Apply fixes**
   - Auto-fix format/lint issues
   - For type/build errors: analyze and fix
   - For test failures: diagnose root cause

4. **Verify fixes**
   ```bash
   pnpm format:check && pnpm lint:check && pnpm build && pnpm test
   ```

5. **Report results**
   - List what was fixed
   - List remaining issues (if any)
   - Do NOT commit unless explicitly requested
