//! Condition pattern 2: Single Parent, Multiple Children
//!
//! Pattern:
//!     A
//!    / \
//!   B   C
//!
//! Expected behavior:
//! - Quest A starts unlocked
//! - Quests B and C start locked (lock_count = 1)
//! - When A is completed, B and C are unlocked
//! - Players can then progress on B and C independently

use starknet::testing::set_block_timestamp;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::{DefinitionAssert, DefinitionTrait};
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
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

fn NAME() -> ByteArray {
    "Quest"
}

fn DESCRIPTION() -> ByteArray {
    "Quest description"
}

#[test]
fn test_single_parent_multiple_children_creation() {
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
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
            to_store: true,
        );

    // [Create] Quest B with condition A
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
            conditions: array![QUEST_A].span(),
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
            to_store: true,
        );

    // [Create] Quest C with condition A
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
            conditions: array![QUEST_A].span(),
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
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
    assert_eq!(definition_b.conditions.len(), 1, "Quest B should have 1 condition");
    assert_eq!(definition_c.conditions.len(), 1, "Quest C should have 1 condition");
}

#[test]
fn test_single_parent_multiple_children_initial_state() {
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
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
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
            conditions: array![QUEST_A].span(),
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
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
            conditions: array![QUEST_A].span(),
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
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
    assert_eq!(completion_b.is_unlocked(), false, "Quest B should be locked");
    assert_eq!(completion_c.is_unlocked(), false, "Quest C should be locked");
}

#[test]
fn test_single_parent_multiple_children_unlock() {
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
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
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
            conditions: array![QUEST_A].span(),
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
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
            conditions: array![QUEST_A].span(),
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
            to_store: true,
        );

    // [Assert] B and C are locked before A completion
    set_block_timestamp(1000);
    let definition_b = store.get_definition(QUEST_B);
    let definition_c = store.get_definition(QUEST_C);

    let completion_b = store.get_completion_or_new(context.player_id, @definition_b, 1000);
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);
    assert_eq!(completion_b.is_unlocked(), false, "Quest B should be locked");
    assert_eq!(completion_c.is_unlocked(), false, "Quest C should be locked");

    // [Progress] Try to progress on B (should not work)
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_B, count: COUNT, to_store: true);

    // [Assert] B has no progress (locked)
    let definition_b = store.get_definition(QUEST_B);
    let interval_id = definition_b.compute_interval_id(1000);
    let advancement_b = store.get_advancement(context.player_id, QUEST_B, TASK_B, interval_id);
    assert_eq!(advancement_b.count, 0, "Quest B should have no progress when locked");

    // [Progress] Complete quest A
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_A, count: TOTAL, to_store: true);

    // [Assert] A is completed
    let definition_a = store.get_definition(QUEST_A);
    let completion_a = store
        .get_completion(context.player_id, QUEST_A, definition_a.compute_interval_id(1000));
    assert_eq!(completion_a.is_completed(), true, "Quest A should be completed");

    // [Assert] B and C are now unlocked
    let completion_b = store.get_completion_or_new(context.player_id, @definition_b, 1000);
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);
    assert_eq!(completion_b.is_unlocked(), true, "Quest B should be unlocked");
    assert_eq!(completion_c.is_unlocked(), true, "Quest C should be unlocked");

    // [Progress] Now can progress on B and C
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_B, count: COUNT, to_store: true);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_C, count: COUNT, to_store: true);

    // [Assert] B and C have progress
    let advancement_b = store.get_advancement(context.player_id, QUEST_B, TASK_B, interval_id);
    let definition_c = store.get_definition(QUEST_C);
    let advancement_c = store
        .get_advancement(
            context.player_id, QUEST_C, TASK_C, definition_c.compute_interval_id(1000),
        );
    assert_eq!(advancement_b.count, COUNT, "Quest B should have progress");
    assert_eq!(advancement_c.count, COUNT, "Quest C should have progress");
}

