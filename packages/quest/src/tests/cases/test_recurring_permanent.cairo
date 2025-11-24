//! Test case 5: Recurring Permanent quest
//!
//! Settings:
//! - Start = 0
//! - End = 0
//! - Duration > 0
//! - Interval > 0
//!
//! Expected behavior:
//! - Quest repeats indefinitely
//! - Each cycle lasts duration seconds and repeats every interval seconds
//! - Quest is active during first duration seconds of each interval-second period
//! - Can be completed once per cycle (different interval_id per cycle)

use starknet::testing::set_block_timestamp;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::{DefinitionAssert, DefinitionTrait};
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
use crate::types::task::TaskTrait;

// Constants

const QUEST_ID: felt252 = 'RECURRING-PERMANENT';
const TASK_ID: felt252 = 'TASK';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;
const ONE_DAY: u64 = 24 * 60 * 60;
const ONE_WEEK: u64 = 7 * ONE_DAY;
const DURATION: u64 = 1 * ONE_DAY; // 1 day
const INTERVAL: u64 = 1 * ONE_WEEK; // 1 week

fn NAME() -> ByteArray {
    "Recurring Permanent Quest"
}

fn DESCRIPTION() -> ByteArray {
    "A quest that repeats indefinitely"
}

#[test]
fn test_recurring_permanent_quest_creation() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest with recurring permanent settings
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: DURATION,
            interval: INTERVAL,
            tasks: tasks,
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

    // [Assert] Quest definition exists
    let definition = store.get_definition(QUEST_ID);
    definition.assert_does_exist();
    assert_eq!(definition.start, 0, "Start should be 0");
    assert_eq!(definition.end, 0, "End should be 0");
    assert_eq!(definition.duration, DURATION, "Duration should be DURATION");
    assert_eq!(definition.interval, INTERVAL, "Interval should be INTERVAL");
}

#[test]
fn test_recurring_permanent_quest_multiple_completions() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: DURATION,
            interval: INTERVAL,
            tasks: tasks,
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

    // [Progress] Complete first cycle
    set_block_timestamp(1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] First cycle completed
    let definition = store.get_definition(QUEST_ID);
    let interval_id_0 = definition.compute_interval_id(1000);
    assert_eq!(interval_id_0, 0, "Interval ID should be 0");
    let completion_0 = store.get_completion(context.player_id, QUEST_ID, interval_id_0);
    assert_eq!(completion_0.is_completed(), true, "First cycle should be completed");

    // [Progress] Complete second cycle
    set_block_timestamp(INTERVAL + 1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] Second cycle completed (different interval_id)
    let interval_id_1 = definition.compute_interval_id(INTERVAL + 1000);
    assert_eq!(interval_id_1, 1, "Interval ID should be 1");
    let completion_1 = store.get_completion(context.player_id, QUEST_ID, interval_id_1);
    assert_eq!(completion_1.is_completed(), true, "Second cycle should be completed");

    // [Assert] First cycle still completed
    assert_eq!(completion_0.is_completed(), true, "First cycle should remain completed");

    // [Progress] Complete third cycle
    set_block_timestamp(2 * INTERVAL + 1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] Third cycle completed
    let interval_id_2 = definition.compute_interval_id(2 * INTERVAL + 1000);
    assert_eq!(interval_id_2, 2, "Interval ID should be 2");
    let completion_2 = store.get_completion(context.player_id, QUEST_ID, interval_id_2);
    assert_eq!(completion_2.is_completed(), true, "Third cycle should be completed");
}

#[test]
fn test_recurring_permanent_quest_claim_multiple_intervals() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: DURATION,
            interval: INTERVAL,
            tasks: tasks,
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

    // [Progress] Complete first cycle
    set_block_timestamp(1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] First cycle completed
    let definition = store.get_definition(QUEST_ID);
    let interval_id_0 = definition.compute_interval_id(1000);
    assert_eq!(interval_id_0, 0, "Interval ID should be 0");
    let completion_0 = store.get_completion(context.player_id, QUEST_ID, interval_id_0);
    assert_eq!(completion_0.is_completed(), true, "First cycle should be completed");
    assert_eq!(completion_0.unclaimed, true, "First cycle should not be claimed yet");

    // [Claim] First cycle
    systems
        .quester
        .claim(player_id: context.player_id, quest_id: QUEST_ID, interval_id: interval_id_0);

    // [Assert] First cycle claimed
    let completion_0 = store.get_completion(context.player_id, QUEST_ID, interval_id_0);
    assert_eq!(completion_0.unclaimed, false, "First cycle should be claimed");

    // [Progress] Complete second cycle
    set_block_timestamp(INTERVAL + 1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] Second cycle completed
    let interval_id_1 = definition.compute_interval_id(INTERVAL + 1000);
    assert_eq!(interval_id_1, 1, "Interval ID should be 1");
    let completion_1 = store.get_completion(context.player_id, QUEST_ID, interval_id_1);
    assert_eq!(completion_1.is_completed(), true, "Second cycle should be completed");
    assert_eq!(completion_1.unclaimed, true, "Second cycle should not be claimed yet");

    // [Claim] Second cycle
    systems
        .quester
        .claim(player_id: context.player_id, quest_id: QUEST_ID, interval_id: interval_id_1);

    // [Assert] Second cycle claimed
    let completion_1 = store.get_completion(context.player_id, QUEST_ID, interval_id_1);
    assert_eq!(completion_1.unclaimed, false, "Second cycle should be claimed");

    // [Assert] First cycle still claimed
    let completion_0 = store.get_completion(context.player_id, QUEST_ID, interval_id_0);
    assert_eq!(completion_0.unclaimed, false, "First cycle should remain claimed");

    // [Progress] Complete third cycle
    set_block_timestamp(2 * INTERVAL + 1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] Third cycle completed
    let interval_id_2 = definition.compute_interval_id(2 * INTERVAL + 1000);
    assert_eq!(interval_id_2, 2, "Interval ID should be 2");
    let completion_2 = store.get_completion(context.player_id, QUEST_ID, interval_id_2);
    assert_eq!(completion_2.is_completed(), true, "Third cycle should be completed");
    assert_eq!(completion_2.unclaimed, true, "Third cycle should not be claimed yet");

    // [Claim] Third cycle
    systems
        .quester
        .claim(player_id: context.player_id, quest_id: QUEST_ID, interval_id: interval_id_2);

    // [Assert] Third cycle claimed
    let completion_2 = store.get_completion(context.player_id, QUEST_ID, interval_id_2);
    assert_eq!(completion_2.unclaimed, false, "Third cycle should be claimed");
}

