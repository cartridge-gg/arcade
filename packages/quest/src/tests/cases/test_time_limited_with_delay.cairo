//! Test case 4: Time-Limited with Delay quest
//!
//! Settings:
//! - Start > 0
//! - End > 0
//! - Duration = 0
//! - Interval = 0
//!
//! Expected behavior:
//! - Quest has a specific time window: active between start and end timestamps
//! - Quest is inactive before start and after end
//! - Can only be completed once per player (interval_id is always 0)

use starknet::testing::set_block_timestamp;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::{DefinitionAssert, DefinitionTrait};
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
use crate::types::metadata::{QuestMetadata, QuestMetadataTrait};
use crate::types::task::TaskTrait;

// Constants

const QUEST_ID: felt252 = 'TIME-LIMITED-DELAY';
const TASK_ID: felt252 = 'TASK';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;
const ONE_WEEK: u64 = 7 * 24 * 60 * 60;
const START: u64 = 4 * ONE_WEEK; // 4 weeks
const END: u64 = 48 * ONE_WEEK; // 48 weeks

fn METADATA() -> QuestMetadata {
    QuestMetadataTrait::new("NAME", "DESCRIPTION", "ICON", array![].span())
}

#[test]
fn test_time_limited_with_delay_quest_creation() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest with time-limited with delay settings
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: START,
            end: END,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Assert] Quest definition exists
    let definition = store.get_definition(QUEST_ID);
    definition.assert_does_exist();
    assert_eq!(definition.start, START, "Start should be START");
    assert_eq!(definition.end, END, "End should be END");
    assert_eq!(definition.duration, 0, "Duration should be 0");
    assert_eq!(definition.interval, 0, "Interval should be 0");
}

#[test]
fn test_time_limited_with_delay_quest_completion_once() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: START,
            end: END,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Progress] Before start - should not progress
    set_block_timestamp(START - 1);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Quest not progressed (inactive)
    let definition = store.get_definition(QUEST_ID);
    let interval_id = definition.compute_interval_id(START);
    let advancement = store.get_advancement(context.player_id, QUEST_ID, TASK_ID, interval_id);
    assert_eq!(advancement.count, 0, "Advancement should be 0 before start");

    // [Progress] At start time
    set_block_timestamp(START);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Quest progressed
    let advancement = store.get_advancement(context.player_id, QUEST_ID, TASK_ID, interval_id);
    assert_eq!(advancement.count, COUNT, "Advancement count should be 50");

    // [Progress] Complete the quest
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Quest is completed
    let completion = store.get_completion(context.player_id, QUEST_ID, interval_id);
    assert_eq!(completion.is_completed(), true, "Quest should be completed");

    // [Progress] After end time - should not progress
    set_block_timestamp(END + 1);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Quest remains completed, no new progress
    let completion = store.get_completion(context.player_id, QUEST_ID, interval_id);
    assert_eq!(completion.is_completed(), true, "Quest should remain completed");
}

#[test]
fn test_time_limited_with_delay_quest_claim() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: START,
            end: END,
            duration: 0,
            interval: 0,
            tasks: tasks,
            conditions: array![].span(),
            metadata: METADATA(),
            to_store: true,
        );

    // [Progress] Complete the quest within time window
    set_block_timestamp(START + 1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] Quest is completed but not claimed
    let definition = store.get_definition(QUEST_ID);
    let interval_id = definition.compute_interval_id(START + 1000);
    let completion = store.get_completion(context.player_id, QUEST_ID, interval_id);
    assert_eq!(completion.is_completed(), true, "Quest should be completed");
    assert_eq!(completion.unclaimed, true, "Quest should not be claimed yet");

    // [Claim] Quest
    systems
        .quester
        .claim(player_id: context.player_id, quest_id: QUEST_ID, interval_id: interval_id);

    // [Assert] Quest is claimed
    let completion = store.get_completion(context.player_id, QUEST_ID, interval_id);
    assert_eq!(completion.unclaimed, false, "Quest should be claimed");
}

