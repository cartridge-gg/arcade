//! Condition pattern 1: Independent Quests
//!
//! Pattern:
//! A (no conditions)
//! B (no conditions)
//!
//! Expected behavior:
//! - Both quests start unlocked (lock_count = 0)
//! - Players can progress on both quests simultaneously
//! - No unlock events are emitted

use starknet::testing::set_block_timestamp;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::DefinitionAssert;
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
use crate::types::task::TaskTrait;

// Constants

const QUEST_A: felt252 = 'QUEST-A';
const QUEST_B: felt252 = 'QUEST-B';
const TASK_A: felt252 = 'TASK-A';
const TASK_B: felt252 = 'TASK-B';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;

fn NAME() -> ByteArray {
    "Quest"
}

fn DESCRIPTION() -> ByteArray {
    "Quest description"
}

#[test]
fn test_independent_quests_creation() {
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
            hidden: false,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
            to_store: true,
        );

    // [Assert] Both quest definitions exist
    let definition_a = store.get_definition(QUEST_A);
    let definition_b = store.get_definition(QUEST_B);
    definition_a.assert_does_exist();
    definition_b.assert_does_exist();
    assert_eq!(definition_a.conditions.len(), 0, "Quest A should have no conditions");
    assert_eq!(definition_b.conditions.len(), 0, "Quest B should have no conditions");
}

#[test]
fn test_independent_quests_initial_state() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Both quests
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

    // [Assert] Both quests start unlocked
    set_block_timestamp(1000);
    let interval_id = 0;

    let completion_a = store.get_completion(context.player_id, QUEST_A, interval_id);
    let completion_b = store.get_completion(context.player_id, QUEST_B, interval_id);

    assert_eq!(completion_a.is_unlocked(), true, "Quest A should be unlocked");
    assert_eq!(completion_b.is_unlocked(), true, "Quest B should be unlocked");
}

#[test]
fn test_independent_quests_progress_simultaneously() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Both quests
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

    // [Progress] On quest A
    set_block_timestamp(1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_A, count: COUNT, to_store: true);

    // [Progress] On quest B
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_B, count: COUNT, to_store: true);

    // [Assert] Both quests have progress
    let interval_id = 0;

    let advancement_a = store.get_advancement(context.player_id, QUEST_A, TASK_A, interval_id);
    let advancement_b = store.get_advancement(context.player_id, QUEST_B, TASK_B, interval_id);

    assert_eq!(advancement_a.count, COUNT, "Quest A should have progress");
    assert_eq!(advancement_b.count, COUNT, "Quest B should have progress");
}

