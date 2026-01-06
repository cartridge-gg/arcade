---
description: Analyze Cairo smart contracts for patterns and security
---

Analyze Cairo contracts:

1. **Scope detection**
   - If path provided: analyze $ARGUMENTS
   - If no argument: analyze changed Cairo files via `git diff --name-only | grep ".cairo$"`

2. **Pattern analysis**
   - Component pattern usage (starknet::component)
   - Trait implementations
   - Storage structure organization
   - Event definitions
   - Error handling patterns

3. **Security checks**

   **Access control:**
   - Caller verification (get_caller_address)
   - Owner/admin checks
   - Role-based permissions

   **State management:**
   - Reentrancy patterns
   - State before external calls
   - Storage collision risks

   **Arithmetic:**
   - Overflow/underflow handling
   - Division by zero guards
   - Precision loss in calculations

4. **Dojo integration**
   - Model definitions correctness
   - World interactions
   - Event emissions
   - System implementations

5. **Optimization opportunities**
   - Storage read/write efficiency
   - Loop optimizations
   - Array operation patterns

6. **Output format**
   ```
   ## Cairo Analysis: {package}

   ### Components
   | Component | Pattern | Status |
   |-----------|---------|--------|
   | Buyable | OK | Correct |

   ### Security
   - [PASS] Access control in {file}
   - [WARN] Missing caller check at {file}:{line}

   ### Recommendations
   1. [file:line] Suggestion
   ```

7. **Verify**
   - Run `scarb build` to ensure no errors
   - Run `scarb test` if tests exist
