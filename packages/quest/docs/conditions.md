# Context

The quest system provides a flexible framework for creating quest dependencies, allowing game developers to design quest chains and unlock systems. When creating a quest, developers can specify prerequisite quests that must be completed before a quest becomes available to players.

This document comprehensively documents the **quest condition system** and various **dependency patterns**. It serves as a reference for game developers to understand:

- How quest unlocking works
- How to design quest chains and dependencies
- Different patterns for organizing quest relationships
- The technical implications of each pattern

By understanding these patterns, developers can design quest systems that guide players through progression paths, create branching narratives, or implement complex unlock requirements.

## How Quest Conditions Work

### Core Mechanism

Each quest can have a list of **prerequisite quests** (conditions) that must be completed before it becomes available:

1. **Initial State**: When a quest is created with conditions, each player's quest completion starts with a `lock_count` equal to the number of prerequisite quests.

2. **Unlocking Process**: When a prerequisite quest is completed, the system automatically decrements the `lock_count` of all dependent quests. A quest becomes **unlocked** when its `lock_count` reaches `0`.

3. **Progress Restriction**: A quest that is **locked** (`lock_count > 0`) cannot accept progress. Players must complete all prerequisite quests before they can start working on a dependent quest.

4. **Bidirectional Relationship**: The system maintains two data structures:
   - `QuestDefinition.conditions`: Lists prerequisite quests (what must be completed)
   - `QuestCondition.quests`: Lists dependent quests (what gets unlocked)

### Key Properties

- **AND Logic**: All prerequisite quests must be completed (not OR logic)
- **Automatic Unlocking**: Unlocking happens automatically when prerequisites are completed
- **One-Time Unlock**: Each prerequisite quest completion decrements the lock count by 1
- **No Circular Dependencies**: The system does not prevent circular dependencies, but they should be avoided in design

## Use Cases

### 1. Independent Quests (No Dependencies)

#### Pattern

```
A (no conditions)
B (no conditions)
```

#### Description

Two quests with no dependencies. Both quests are immediately available to all players from the start. This is the simplest pattern, useful for parallel quest lines or independent objectives.

#### Configuration

- Quest A: `conditions = []`
- Quest B: `conditions = []`

#### Behavior

- Both quests start with `lock_count = 0` (unlocked)
- Players can progress on both quests simultaneously
- No unlock events are emitted

**Status**: ✅ Common pattern for parallel content

---

### 2. Single Parent, Multiple Children

#### Pattern

```
    A
   / \
  B   C
```

#### Description

One parent quest unlocks two child quests. When quest A is completed, both B and C become available. This pattern is useful for branching narratives or offering players multiple paths after completing a milestone.

#### Configuration

- Quest A: `conditions = []`
- Quest B: `conditions = [A]`
- Quest C: `conditions = [A]`

#### Behavior

- Quest A starts unlocked (`lock_count = 0`)
- Quests B and C start locked (`lock_count = 1`)
- When A is completed:
  - B's `lock_count` decrements to 0 (unlocked)
  - C's `lock_count` decrements to 0 (unlocked)
  - Two `QuestUnlocked` events are emitted (one for B, one for C)
- Players can then progress on B and C independently

**Status**: ✅ Common pattern for branching quests

---

### 3. Multiple Parents, Single Child

#### Pattern

```
A   B
 \ /
  C
```

#### Description

Two parent quests must both be completed to unlock a single child quest. This pattern implements AND logic, requiring players to complete multiple objectives before accessing the next quest. Useful for ensuring players have explored multiple paths or completed different types of objectives.

#### Configuration

- Quest A: `conditions = []`
- Quest B: `conditions = []`
- Quest C: `conditions = [A, B]`

#### Behavior

- Quests A and B start unlocked (`lock_count = 0`)
- Quest C starts locked (`lock_count = 2`)
- When A is completed:
  - C's `lock_count` decrements to 1 (still locked)
  - No unlock event for C
- When B is completed:
  - C's `lock_count` decrements to 0 (unlocked)
  - `QuestUnlocked` event is emitted for C
- Players can only progress on C after both A and B are completed

**Status**: ✅ Common pattern for convergence quests

---

### 4. Diamond Pattern

#### Pattern

```
    A
   / \
  B   C
   \ /
    D
```

#### Description

A diamond-shaped dependency graph where one quest (A) unlocks two parallel quests (B and C), and both B and C must be completed to unlock a final quest (D). This pattern creates a progression path that branches and then converges, useful for ensuring players experience multiple paths before reaching a conclusion.

#### Configuration

- Quest A: `conditions = []`
- Quest B: `conditions = [A]`
- Quest C: `conditions = [A]`
- Quest D: `conditions = [B, C]`

#### Behavior

- Quest A starts unlocked (`lock_count = 0`)
- Quests B and C start locked (`lock_count = 1`)
- Quest D starts locked (`lock_count = 2`)
- When A is completed:
  - B and C are unlocked (`lock_count = 0`)
  - Two `QuestUnlocked` events are emitted
- When B is completed:
  - D's `lock_count` decrements to 1 (still locked)
- When C is completed:
  - D's `lock_count` decrements to 0 (unlocked)
  - `QuestUnlocked` event is emitted for D
- Players must complete A → B and C → D in sequence

**Status**: ✅ Common pattern for complex progression

---

### 5. Linear Chain

#### Pattern

```
A → B → C → D
```

#### Description

A simple linear progression where each quest unlocks the next one in sequence. This pattern creates a clear progression path, useful for tutorials, story chapters, or sequential objectives.

#### Configuration

- Quest A: `conditions = []`
- Quest B: `conditions = [A]`
- Quest C: `conditions = [B]`
- Quest D: `conditions = [C]`

#### Behavior

- Only Quest A starts unlocked (`lock_count = 0`)
- Quests B, C, and D start locked (`lock_count = 1` each)
- When A is completed:
  - B is unlocked (`lock_count = 0`)
  - `QuestUnlocked` event is emitted for B
- When B is completed:
  - C is unlocked (`lock_count = 0`)
  - `QuestUnlocked` event is emitted for C
- When C is completed:
  - D is unlocked (`lock_count = 0`)
  - `QuestUnlocked` event is emitted for D
- Players must complete quests in strict order: A → B → C → D

**Status**: ✅ Common pattern for sequential content

---

### 6. Tree with Multiple Levels

#### Pattern

```
    A
   / \
  B   C
 / \
D   E
```

#### Description

A hierarchical tree structure with multiple levels of dependencies. One root quest (A) unlocks two branches (B and C), and one branch (B) further unlocks two more quests (D and E). This pattern allows for complex branching narratives with different depths.

#### Configuration

- Quest A: `conditions = []`
- Quest B: `conditions = [A]`
- Quest C: `conditions = [A]`
- Quest D: `conditions = [B]`
- Quest E: `conditions = [B]`

#### Behavior

- Quest A starts unlocked (`lock_count = 0`)
- Quests B and C start locked (`lock_count = 1`)
- Quests D and E start locked (`lock_count = 1` each)
- When A is completed:
  - B and C are unlocked (`lock_count = 0`)
  - Two `QuestUnlocked` events are emitted
- When B is completed:
  - D and E are unlocked (`lock_count = 0`)
  - Two `QuestUnlocked` events are emitted
- Players can follow different paths: A → B → D/E or A → C (which has no children)

**Status**: ✅ Common pattern for branching narratives

---

### 7. Convergent Paths with Shared Prerequisite

#### Pattern

```
A   B
 \ /
  C
  |
  D
```

#### Description

Two independent paths (A and B) converge into a shared quest (C), which then unlocks a final quest (D). This pattern ensures players complete multiple objectives before accessing shared content, then continue to a final objective.

#### Configuration

- Quest A: `conditions = []`
- Quest B: `conditions = []`
- Quest C: `conditions = [A, B]`
- Quest D: `conditions = [C]`

#### Behavior

- Quests A and B start unlocked (`lock_count = 0`)
- Quest C starts locked (`lock_count = 2`)
- Quest D starts locked (`lock_count = 1`)
- When A is completed:
  - C's `lock_count` decrements to 1 (still locked)
- When B is completed:
  - C's `lock_count` decrements to 0 (unlocked)
  - `QuestUnlocked` event is emitted for C
- When C is completed:
  - D's `lock_count` decrements to 0 (unlocked)
  - `QuestUnlocked` event is emitted for D
- Players must complete both A and B before accessing C, then complete C to access D

**Status**: ✅ Common pattern for multi-path convergence

---

## Technical Notes

- **Lock Count Initialization**: When a quest is created with `n` conditions, each player's quest completion is initialized with `lock_count = n`.

- **Unlock Mechanism**: Each time a prerequisite quest is completed, the system:
  1. Finds all dependent quests via `QuestCondition`
  2. Decrements their `lock_count` by 1
  3. Emits a `QuestUnlocked` event when `lock_count` reaches 0

- **Progress Blocking**: The `progress` function checks `completion.is_unlocked()` before allowing any progress. Locked quests cannot accept progress updates.

- **Event Emission**: `QuestUnlocked` events are emitted when a quest transitions from locked to unlocked state, allowing frontends to update UI accordingly.

- **No Circular Dependencies**: While the system doesn't prevent circular dependencies at the code level, they should be avoided in quest design as they can create deadlock situations.

- **Multiple Prerequisites**: When a quest has multiple prerequisites, all must be completed (AND logic). The system does not support OR logic for prerequisites.
