//! Condition pattern 3: Multiple Parents, Single Child
//!
//! Pattern:
//! A   B
//!  \ /
//!   C
//!
//! Expected behavior:
//! - Quests A and B start unlocked
//! - Quest C starts locked (lock_count = 2)
//! - When A is completed, C's lock_count decrements to 1 (still locked)
//! - When B is completed, C's lock_count decrements to 0 (unlocked)
//! - Players can only progress on C after both A and B are completed

use starknet::testing::set_block_timestamp;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::DefinitionAssert;
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
use crate::types::metadata::{QuestMetadata, QuestMetadataTrait};
use crate::types::task::TaskTrait;

// Constants

const QUEST_A: felt252 = 'QUEST-A';
const QUEST_B: felt252 = 'QUEST-B';
const QUEST_C: felt252 = 'QUEST-C';
const TASK_A: felt252 = 'TASK-A';
const TASK_B: felt252 = 'TASK-B';
const TASK_C: felt252 = 'TASK-C';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;

fn METADATA() -> QuestMetadata {
    QuestMetadataTrait::new("NAME", "DESCRIPTION", "ICON", array![].span())
}

#[test]
fn test_multiple_parents_single_child_creation() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest A with no conditions
    let tasks_a = array![TaskTrait::new(TASK_A, TOTAL, "Task A Description")].span();
    systems
        .quester
        .create(
            id: QUEST_A,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_a,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Create] Quest B with no conditions
    let tasks_b = array![TaskTrait::new(TASK_B, TOTAL, "Task B Description")].span();
    systems
        .quester
        .create(
            id: QUEST_B,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_b,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Create] Quest C with conditions A and B
    let tasks_c = array![TaskTrait::new(TASK_C, TOTAL, "Task C Description")].span();
    systems
        .quester
        .create(
            id: QUEST_C,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_c,
            conditions: array![QUEST_A, QUEST_B].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Assert] Quest definitions exist with correct conditions
    let definition_a = store.get_definition(QUEST_A);
    let definition_b = store.get_definition(QUEST_B);
    let definition_c = store.get_definition(QUEST_C);

    definition_a.assert_does_exist();
    definition_b.assert_does_exist();
    definition_c.assert_does_exist();

    assert_eq!(definition_a.conditions.len(), 0, "Quest A should have no conditions");
    assert_eq!(definition_b.conditions.len(), 0, "Quest B should have no conditions");
    assert_eq!(definition_c.conditions.len(), 2, "Quest C should have 2 conditions");
}

#[test]
fn test_multiple_parents_single_child_initial_state() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] All quests
    let tasks_a = array![TaskTrait::new(TASK_A, TOTAL, "Task A Description")].span();
    systems
        .quester
        .create(
            id: QUEST_A,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_a,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    let tasks_b = array![TaskTrait::new(TASK_B, TOTAL, "Task B Description")].span();
    systems
        .quester
        .create(
            id: QUEST_B,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_b,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    let tasks_c = array![TaskTrait::new(TASK_C, TOTAL, "Task C Description")].span();
    systems
        .quester
        .create(
            id: QUEST_C,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_c,
            conditions: array![QUEST_A, QUEST_B].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Assert] Initial state
    set_block_timestamp(1000);
    let definition_a = store.get_definition(QUEST_A);
    let definition_b = store.get_definition(QUEST_B);
    let definition_c = store.get_definition(QUEST_C);

    let completion_a = store.get_completion_or_new(context.player_id, @definition_a, 1000);
    let completion_b = store.get_completion_or_new(context.player_id, @definition_b, 1000);
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);

    assert_eq!(completion_a.is_unlocked(), true, "Quest A should be unlocked");
    assert_eq!(completion_b.is_unlocked(), true, "Quest B should be unlocked");
    assert_eq!(completion_c.is_unlocked(), false, "Quest C should be locked");
}

#[test]
fn test_multiple_parents_single_child_unlock() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] All quests
    let tasks_a = array![TaskTrait::new(TASK_A, TOTAL, "Task A Description")].span();
    systems
        .quester
        .create(
            id: QUEST_A,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_a,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    let tasks_b = array![TaskTrait::new(TASK_B, TOTAL, "Task B Description")].span();
    systems
        .quester
        .create(
            id: QUEST_B,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_b,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    let tasks_c = array![TaskTrait::new(TASK_C, TOTAL, "Task C Description")].span();
    systems
        .quester
        .create(
            id: QUEST_C,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_c,
            conditions: array![QUEST_A, QUEST_B].span(),
            metadata: METADATA(),
            to_store: true,
        );

    set_block_timestamp(1000);
    let interval_id = 0;

    // [Assert] C is locked initially
    let definition_c = store.get_definition(QUEST_C);

    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);

    assert_eq!(completion_c.is_unlocked(), false, "Quest C should be locked");

    // [Progress] Try to progress on C (should not work)
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_C, count: COUNT, to_store: true);

    // [Assert] C has no progress (locked)
    let advancement_c = store.get_advancement(context.player_id, QUEST_C, TASK_C, interval_id);
    assert_eq!(advancement_c.count, 0, "Quest C should have no progress when locked");

    // [Progress] Complete quest A
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_A, count: TOTAL, to_store: true);

    // [Assert] A is completed
    let completion_a = store.get_completion(context.player_id, QUEST_A, interval_id);
    assert_eq!(completion_a.is_completed(), true, "Quest A should be completed");

    // [Assert] C is still locked (needs B too)
    let definition_c = store.get_definition(QUEST_C);

    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);

    assert_eq!(completion_c.is_unlocked(), false, "Quest C should still be locked");

    // [Progress] Try to progress on C (should still not work)
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_C, count: COUNT, to_store: true);

    // [Assert] C still has no progress
    let advancement_c = store.get_advancement(context.player_id, QUEST_C, TASK_C, interval_id);
    assert_eq!(advancement_c.count, 0, "Quest C should still have no progress");

    // [Progress] Complete quest B
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_B, count: TOTAL, to_store: true);

    // [Assert] B is completed
    let completion_b = store.get_completion(context.player_id, QUEST_B, interval_id);
    assert_eq!(completion_b.is_completed(), true, "Quest B should be completed");

    // [Assert] C is now unlocked
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);
    assert_eq!(completion_c.is_unlocked(), true, "Quest C should be unlocked");

    // [Progress] Now can progress on C
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_C, count: COUNT, to_store: true);

    // [Assert] C has progress
    let advancement_c = store.get_advancement(context.player_id, QUEST_C, TASK_C, interval_id);
    assert_eq!(advancement_c.count, COUNT, "Quest C should have progress");
}

