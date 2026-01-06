---
description: Respond to PR feedback and update changes
---

Respond to pull request review feedback:

1. **Read review comments**
   ```bash
   gh pr view $ARGUMENTS --comments
   gh api repos/{owner}/{repo}/pulls/{number}/comments
   ```

2. **Address each comment**
   - Read and understand the feedback
   - Make requested changes
   - Run checks after changes:
     ```bash
     pnpm format:check && pnpm lint:check && pnpm type:check && pnpm build && pnpm test
     ```

3. **Commit strategy**

   **Amend** when:
   - Small fixes to existing commit
   - Typos or formatting issues
   - Single logical change

   **New commit** when:
   - Addressing separate concern
   - Significant changes
   - Want to preserve review history

4. **Push changes safely**
   Always use `--force-with-lease` for amended commits:
   ```bash
   git push --force-with-lease
   ```
   NEVER use bare `--force`

5. **Resolve conversations**
   - Reply to comments explaining changes made
   - Mark conversations as resolved when addressed
   - Update PR description if scope changed

6. **Re-request review**
   ```bash
   gh pr ready
   ```
   Or request specific reviewers:
   ```bash
   gh pr edit --add-reviewer username
   ```

7. **Update PR description**
   If significant changes made:
   ```bash
   gh pr edit --body "$(cat <<'EOF'
   ## Summary
   - Updated description

   ## Test plan
   - [ ] Updated testing steps
   EOF
   )"
   ```
