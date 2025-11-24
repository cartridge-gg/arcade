# Context

The quest system provides a flexible framework for creating time-based quests with various scheduling patterns. When creating a quest, developers can configure four time-related parameters that control when and how often a quest is available to players:

- **`start`**: The timestamp when the quest becomes available (use `0` for immediate availability)
- **`end`**: The timestamp when the quest expires (use `0` for no expiration)
- **`duration`**: The length of each quest cycle in seconds (only meaningful when `interval > 0`)
- **`interval`**: The time between quest cycles in seconds (use `0` for non-recurring quests)

These parameters enable a wide range of quest patterns, from simple permanent quests to complex recurring events with specific time windows. However, not all combinations of these parameters are valid or meaningful.

This document comprehensively documents all **valid use cases** for quest time configuration. It serves as a reference for game developers to understand:

- Which time configurations are supported
- How each configuration behaves
- When to use each pattern
- The technical implications of each choice

By understanding these use cases, developers can design quest systems that match their game's needs, whether they require one-time achievements, limited-time events, daily challenges, or weekly recurring quests.

## Summary

| Case | Start | End | Duration | Interval | Status | Description                       |
| ---- | ----- | --- | -------- | -------- | ------ | --------------------------------- |
| 1    | 0     | 0   | 0        | 0        | ✅     | Permanent                         |
| 2    | >0    | 0   | 0        | 0        | ✅     | Delayed Permanent                 |
| 3    | 0     | >0  | 0        | 0        | ✅     | Time-Limited                      |
| 4    | >0    | >0  | 0        | 0        | ✅     | Time-Limited with Delay           |
| 5    | 0     | 0   | >0       | >0       | ✅     | Recurring Permanent               |
| 6    | >0    | 0   | >0       | >0       | ✅     | Recurring Permanent with Delay    |
| 7    | 0     | >0  | >0       | >0       | ✅     | Recurring Time-Limited            |
| 8    | >0    | >0  | >0       | >0       | ✅     | Recurring Time-Limited with Delay |

## Important Note

**Assertion Rule**: The `assert_valid_interval` assertion enforces that `duration` and `interval` must both be zero or both be non-zero. Any combination where one is zero and the other is non-zero is **rejected** during quest creation.

- ✅ **Valid**: `duration = 0` and `interval = 0` (cases 1-4)
- ✅ **Valid**: `duration > 0` and `interval > 0` (cases 5-8)
- ❌ **Invalid**: `duration > 0` and `interval = 0` - rejected by assertion
- ❌ **Invalid**: `duration = 0` and `interval > 0` - rejected by assertion

This document only covers the 8 valid use cases. The 8 invalid combinations are not documented as they cannot be created.

## Use Cases

### 1. Permanent

#### Settings

- Start = 0
- End = 0
- Duration = 0
- Interval = 0

#### Interpretation

This is the default setup for a quest. The quest starts immediately and lasts forever. The quest is always active regardless of the current time. Once completed by a player, it cannot be completed again (the `interval_id` is always 0 for permanent quests, so there is only one completion instance per player).

**Status**: ✅ Allowed

---

### 2. Delayed Permanent

#### Settings

- Start > 0
- End = 0
- Duration = 0
- Interval = 0

#### Interpretation

This is very similar to the default setup, however the beginning is delayed until a specified timestamp. Once the start time is reached, the quest becomes active and remains active forever. Once completed by a player, it cannot be completed again (the `interval_id` is always 0 for permanent quests, so there is only one completion instance per player).

**Status**: ✅ Allowed

---

### 3. Time-Limited

#### Settings

- Start = 0
- End > 0
- Duration = 0
- Interval = 0

#### Interpretation

The quest starts immediately and remains active until the end timestamp is reached. After the end time, the quest becomes inactive. Once completed by a player, it cannot be completed again (the `interval_id` is always 0 for non-recurring quests, so there is only one completion instance per player).

**Status**: ✅ Allowed

---

### 4. Time-Limited with Delay

#### Settings

- Start > 0
- End > 0
- Duration = 0
- Interval = 0

#### Interpretation

The quest has a specific time window: it becomes active at the start timestamp and becomes inactive at the end timestamp. Once completed by a player, it cannot be completed again (the `interval_id` is always 0 for non-recurring quests, so there is only one completion instance per player).

**Status**: ✅ Allowed

---

### 5. Recurring Permanent

#### Settings

- Start = 0
- End = 0
- Duration > 0
- Interval > 0

#### Interpretation

The quest repeats indefinitely. Each cycle lasts `duration` seconds and repeats every `interval` seconds. The quest is active during the first `duration` seconds of each `interval`-second period. Players can complete the quest once per interval cycle (identified by `interval_id`). Each cycle has a different `interval_id`, allowing the quest to be completed multiple times.

**Status**: ✅ Allowed

---

### 6. Recurring Permanent with Delay

#### Settings

- Start > 0
- End = 0
- Duration > 0
- Interval > 0

#### Interpretation

The quest starts recurring at the start timestamp. Each cycle lasts `duration` seconds and repeats every `interval` seconds. The first cycle begins at `start`, and subsequent cycles begin at `start + n * interval` where `n` is the cycle number. The quest remains active for `duration` seconds within each cycle. Players can complete the quest once per interval cycle (identified by `interval_id`). Each cycle has a different `interval_id`, allowing the quest to be completed multiple times.

**Status**: ✅ Allowed

---

### 7. Recurring Time-Limited

#### Settings

- Start = 0
- End > 0
- Duration > 0
- Interval > 0

#### Interpretation

The quest repeats within a time window. It starts immediately and repeats every `interval` seconds until the end timestamp. Each cycle lasts `duration` seconds. The quest is only active during cycles that fall within the [0, end) time window. Players can complete the quest once per interval cycle (identified by `interval_id`). Each cycle has a different `interval_id`, allowing the quest to be completed multiple times.

**Status**: ✅ Allowed

---

### 8. Recurring Time-Limited with Delay

#### Settings

- Start > 0
- End > 0
- Duration > 0
- Interval > 0

#### Interpretation

The quest repeats within a specific time window. It starts recurring at the start timestamp and continues until the end timestamp. Each cycle lasts `duration` seconds and repeats every `interval` seconds. The quest is only active during cycles that fall within the [start, end) time window. Players can complete the quest once per interval cycle (identified by `interval_id`). Each cycle has a different `interval_id`, allowing the quest to be completed multiple times.

**Status**: ✅ Allowed

---

## Technical Notes

- For recurring quests (cases 5-8), each cycle is identified by an `interval_id` computed as `(time - start) / interval`.
- The quest is active during a cycle when `(time - start) % interval < duration`.
- **Completion behavior**:
  - Non-recurring quests (cases 1-4): Can only be completed once per player (always `interval_id = 0`).
  - Recurring quests (cases 5-8): Can be completed once per cycle, allowing multiple completions as each cycle has a unique `interval_id`.
