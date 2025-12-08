//! Condition pattern 5: Linear Chain
//!
//! Pattern:
//! A → B → C → D
//!
//! Expected behavior:
//! - Only Quest A starts unlocked
//! - Quests B, C, and D start locked (lock_count = 1 each)
//! - When A is completed, B is unlocked
//! - When B is completed, C is unlocked
//! - When C is completed, D is unlocked
//! - Players must complete quests in strict order

use starknet::testing::set_block_timestamp;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::DefinitionAssert;
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::{METADATA, spawn_game};
use crate::types::task::TaskTrait;

// Constants

const QUEST_A: felt252 = 'QUEST-A';
const QUEST_B: felt252 = 'QUEST-B';
const QUEST_C: felt252 = 'QUEST-C';
const QUEST_D: felt252 = 'QUEST-D';
const TASK_A: felt252 = 'TASK-A';
const TASK_B: felt252 = 'TASK-B';
const TASK_C: felt252 = 'TASK-C';
const TASK_D: felt252 = 'TASK-D';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;

#[test]
fn test_linear_chain_creation() {
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
            metadata: METADATA(),
            to_store: true,
        );

    // [Create] Quest C with condition B
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
            conditions: array![QUEST_B].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Create] Quest D with condition C
    let tasks_d = array![TaskTrait::new(TASK_D, TOTAL, "Task D Description")].span();
    systems
        .quester
        .create(
            id: QUEST_D,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_d,
            conditions: array![QUEST_C].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Assert] Quest definitions exist with correct conditions
    let definition_a = store.get_definition(QUEST_A);
    let definition_b = store.get_definition(QUEST_B);
    let definition_c = store.get_definition(QUEST_C);
    let definition_d = store.get_definition(QUEST_D);

    definition_a.assert_does_exist();
    definition_b.assert_does_exist();
    definition_c.assert_does_exist();
    definition_d.assert_does_exist();

    assert_eq!(definition_a.conditions.len(), 0, "Quest A should have no conditions");
    assert_eq!(definition_b.conditions.len(), 1, "Quest B should have 1 condition");
    assert_eq!(definition_c.conditions.len(), 1, "Quest C should have 1 condition");
    assert_eq!(definition_d.conditions.len(), 1, "Quest D should have 1 condition");
}

#[test]
fn test_linear_chain_unlock_sequence() {
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
            conditions: array![QUEST_A].span(),
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
            conditions: array![QUEST_B].span(),
            metadata: METADATA(),
            to_store: true,
        );

    let tasks_d = array![TaskTrait::new(TASK_D, TOTAL, "Task D Description")].span();
    systems
        .quester
        .create(
            id: QUEST_D,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
            tasks: tasks_d,
            conditions: array![QUEST_C].span(),
            metadata: METADATA(),
            to_store: true,
        );

    set_block_timestamp(1000);
    let interval_id = 0;

    // [Assert] Initial state - only A is unlocked
    let definition_a = store.get_definition(QUEST_A);
    let completion_a = store.get_completion_or_new(context.player_id, @definition_a, 1000);
    let definition_b = store.get_definition(QUEST_B);
    let completion_b = store.get_completion_or_new(context.player_id, @definition_b, 1000);
    let definition_c = store.get_definition(QUEST_C);
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);
    let definition_d = store.get_definition(QUEST_D);
    let completion_d = store.get_completion_or_new(context.player_id, @definition_d, 1000);

    assert_eq!(completion_a.is_unlocked(), true, "Quest A should be unlocked");
    assert_eq!(completion_b.is_unlocked(), false, "Quest B should be locked");
    assert_eq!(completion_c.is_unlocked(), false, "Quest C should be locked");
    assert_eq!(completion_d.is_unlocked(), false, "Quest D should be locked");

    // [Progress] Complete quest A
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_A, count: TOTAL, to_store: true);

    // [Assert] A is completed, B is unlocked
    let definition_a = store.get_definition(QUEST_A);
    let completion_a = store.get_completion_or_new(context.player_id, @definition_a, 1000);
    let definition_b = store.get_definition(QUEST_B);
    let completion_b = store.get_completion_or_new(context.player_id, @definition_b, 1000);
    let definition_c = store.get_definition(QUEST_C);
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);
    let definition_d = store.get_definition(QUEST_D);
    let completion_d = store.get_completion_or_new(context.player_id, @definition_d, 1000);

    assert_eq!(completion_a.is_completed(), true, "Quest A should be completed");
    assert_eq!(completion_b.is_unlocked(), true, "Quest B should be unlocked");
    assert_eq!(completion_c.is_unlocked(), false, "Quest C should still be locked");
    assert_eq!(completion_d.is_unlocked(), false, "Quest D should still be locked");

    // [Progress] Complete quest B
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_B, count: TOTAL, to_store: true);

    // [Assert] B is completed, C is unlocked
    let definition_b = store.get_definition(QUEST_B);
    let completion_b = store.get_completion_or_new(context.player_id, @definition_b, 1000);
    let definition_c = store.get_definition(QUEST_C);
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);
    let definition_d = store.get_definition(QUEST_D);
    let completion_d = store.get_completion_or_new(context.player_id, @definition_d, 1000);

    assert_eq!(completion_b.is_completed(), true, "Quest B should be completed");
    assert_eq!(completion_c.is_unlocked(), true, "Quest C should be unlocked");
    assert_eq!(completion_d.is_unlocked(), false, "Quest D should still be locked");

    // [Progress] Complete quest C
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_C, count: TOTAL, to_store: true);

    // [Assert] C is completed, D is unlocked
    let definition_c = store.get_definition(QUEST_C);
    let completion_c = store.get_completion_or_new(context.player_id, @definition_c, 1000);
    let definition_d = store.get_definition(QUEST_D);
    let completion_d = store.get_completion_or_new(context.player_id, @definition_d, 1000);

    assert_eq!(completion_c.is_completed(), true, "Quest C should be completed");
    assert_eq!(completion_d.is_unlocked(), true, "Quest D should be unlocked");

    // [Progress] Now can progress on D
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_D, count: COUNT, to_store: true);

    // [Assert] D has progress
    let advancement_d = store.get_advancement(context.player_id, QUEST_D, TASK_D, interval_id);
    assert_eq!(advancement_d.count, COUNT, "Quest D should have progress");
}

