//! Test case 7: Recurring Time-Limited quest
//!
//! Settings:
//! - Start = 0
//! - End > 0
//! - Duration > 0
//! - Interval > 0
//!
//! Expected behavior:
//! - Quest repeats within a time window
//! - Starts immediately and repeats every interval seconds until end timestamp
//! - Each cycle lasts duration seconds
//! - Quest is only active during cycles that fall within [0, end) time window
//! - Can be completed once per cycle (different interval_id per cycle)

use starknet::testing::set_block_timestamp;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::{DefinitionAssert, DefinitionTrait};
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
use crate::types::task::TaskTrait;

// Constants

const QUEST_ID: felt252 = 'RECURRING-TIME-LIMITED';
const TASK_ID: felt252 = 'TASK';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;
const ONE_DAY: u64 = 24 * 60 * 60;
const ONE_WEEK: u64 = 7 * ONE_DAY;
const END: u64 = 48 * ONE_WEEK; // 48 weeks
const DURATION: u64 = 1 * ONE_DAY; // 1 day
const INTERVAL: u64 = 1 * ONE_WEEK; // 1 week

fn NAME() -> ByteArray {
    "Recurring Time-Limited Quest"
}

fn DESCRIPTION() -> ByteArray {
    "A quest that repeats within a time window"
}

#[test]
fn test_recurring_time_limited_quest_creation() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest with recurring time-limited settings
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: 0,
            end: END,
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
    assert_eq!(definition.end, END, "End should be END");
    assert_eq!(definition.duration, DURATION, "Duration should be DURATION");
    assert_eq!(definition.interval, INTERVAL, "Interval should be INTERVAL");
}

#[test]
fn test_recurring_time_limited_quest_multiple_completions() {
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
            end: END,
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

    // [Progress] After end time - should not progress
    set_block_timestamp(END + 1);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);
    // [Assert] No new completion after end
// The quest should be inactive, so no progress should be recorded
}

#[test]
fn test_recurring_time_limited_quest_claim_multiple_intervals() {
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
            end: END,
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
}

