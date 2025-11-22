# Quests

The Cartridge Quests is a system for games to create and manage quests for players to complete.

## Key Features

- **Packages**: Games can define quests thanks to the provided packages.
- **Time-based Quests**: Support for quests with start/end times, duration, and intervals.
- **Quest Groups**: Organize quests into groups for better categorization and display.
- **Hidden Quests**: Create hidden quests that are not visible in the controller UI.
- **Tasks**: Each quest contains multiple tasks that players must complete.
- **On-chain Storage**: Optional on-chain storage of quest definitions and player progress using Dojo models.
- **Task-Quest Association**: Automatic association between tasks and quests for efficient progress tracking.
- **Profile**: Players can view their quest progress and completion status without leaving the game.

## Benefits for Game Developers

- **Simplicity**: Easy integration with existing Starknet smart contracts and Dojo.
- **Flexibility**: Choose between event-only (cost-effective) or on-chain storage (queryable) modes.
- **Time Management**: Support for time-limited quests, recurring quests, and quest grouping.
- **Efficient Tracking**: Task-quest associations allow a single progress event to update multiple quests.
- **Performance** (coming soon): Plugin attached to Torii to improve the performances of the quest computation.

## Architecture

### Models

The quest system uses Dojo models for on-chain storage:

- **`QuestDefinition`**: Stores quest definitions including:
  - `id`: Unique quest identifier
  - `rewarder`: Contract address for rewarding players
  - `start`/`end`: Quest time boundaries (use `0` for everlasting)
  - `duration`/`interval`: For recurring quests
  - `tasks`: Array of tasks required to complete the quest
  - `metadata`: JSON-encoded quest metadata (name, description, hidden, index, group, icon, data)

- **`QuestCompletion`**: Tracks quest completion status:
  - Keys: `player_id`, `quest_id`, `interval_id`
  - `timestamp`: When the quest was completed (0 if not completed)

- **`QuestAdvancement`**: Tracks player progress on individual tasks:
  - Keys: `player_id`, `quest_id`, `task_id`, `interval_id`
  - `count`: Current progress count
  - `timestamp`: When the task was completed (0 if not completed)

- **`QuestAssociation`**: Maps tasks to quests:
  - Key: `task_id`
  - `quests`: Array of quest IDs that use this task

### Events

The system emits events for off-chain processing:

- **`QuestCreation`**: Emitted when a quest is created, contains the quest definition.
- **`QuestProgression`**: Emitted when a player progresses on a task, contains player_id, task_id, count, and timestamp.

## How It Works?

### Creation

Quests are created using the `QuestableComponent` with the following parameters:

- **Core**: `id` (unique identifier), `rewarder` (contract address for rewards)
- **Timing**: `start`, `end` (timestamps, use `0` for everlasting), `duration`, `interval` (for recurring quests)
- **Metadata**: `name`, `description`, `hidden`, `index`, `group`, `icon`, `data` (stored as JSON)
- **Tasks**: Array of `Task` structs, each with `id`, `total` (target count), and `description`
- **Storage**: `to_store` flag to enable on-chain storage

When `to_store` is enabled:
1. The quest definition is stored as a `QuestDefinition` model
2. Task-quest associations are automatically created/updated in `QuestAssociation` models

### Progression

Player progression is tracked via the `progress` function:

- **Input**: `player_id`, `task_id`, `count` (progress amount), `to_store` flag
- **Event**: Always emits a `QuestProgression` event for off-chain processing
- **On-chain Updates** (when `to_store` is enabled):
  1. Retrieves all quests associated with the task via `QuestAssociation`
  2. For each active quest, updates the player's `QuestAdvancement` for that task
  3. Checks if the task is completed (count >= total)
  4. If all tasks in a quest are completed, updates the `QuestCompletion` model

### Time-based Quests

The system supports complex time-based quest mechanics:

- **Everlasting**: Set `start` and `end` to `0`
- **Time-limited**: Set `start` and `end` timestamps
- **Recurring**: Use `interval` and `duration` to create quests that repeat
  - `interval`: Time between quest cycles
  - `duration`: How long each cycle lasts
  - `interval_id`: Automatically computed to track which cycle the player is in

### Integration

The quest system supports two modes:

1. **Event-only mode** (`to_store = false`): Cost-effective, all computation happens off-chain via the controller
2. **On-chain storage mode** (`to_store = true`): Quest definitions and progress are stored on-chain, enabling direct queries and smart contract interactions

The controller can process events off-chain for both modes, providing a unified interface for quest management.
