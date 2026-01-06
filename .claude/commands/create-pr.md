---
description: Create a pull request with conventional commits
---

Create a pull request following project conventions:

1. **Pre-PR checklist**
   Run all checks before creating PR:
   ```bash
   pnpm format:check && pnpm lint:check && pnpm type:check && pnpm build && pnpm test
   ```

2. **Conventional commit format**
   Commit types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `refactor`: Code refactoring
   - `docs`: Documentation changes
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

   Format: `type(scope): description`
   Example: `feat(marketplace): add metadata filtering`

3. **PR title**
   - Must match conventional commit format
   - Use imperative mood ("add" not "added")
   - Keep under 72 characters

4. **PR body template**
   ```markdown
   ## Summary
   - Bullet points describing changes

   ## Test plan
   - [ ] Manual testing steps
   - [ ] Unit tests added/updated
   ```

5. **Create PR**
   ```bash
   gh pr create --title "type(scope): description" --body "$(cat <<'EOF'
   ## Summary
   - Change description

   ## Test plan
   - [ ] Testing steps
   EOF
   )"
   ```

6. **Final checklist**
   - [ ] All tests pass
   - [ ] Code is formatted
   - [ ] Build succeeds
   - [ ] No lint warnings
   - [ ] PR description is clear
