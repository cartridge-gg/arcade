//! Test case 2: Delayed Permanent achievement
//!
//! Settings:
//! - Start > 0
//! - End = 0
//!
//! Expected behavior:
//! - Achievement becomes active at start timestamp and remains active forever
//! - Achievement is inactive before start time
//! - Can only be completed once per player

use achievement::models::completion::{CompletionAssert, CompletionTrait};
use achievement::models::definition::DefinitionAssert;
use achievement::store::StoreTrait;
use achievement::tests::mocks::achiever::IAchieverDispatcherTrait;
use achievement::tests::setup::setup::spawn_game;
use achievement::types::metadata::{AchievementMetadata, MetadataTrait};
use achievement::types::task::TaskTrait;
use starknet::testing::set_block_timestamp;

// Constants

const ACHIEVEMENT_ID: felt252 = 'DELAYED-PERMANENT';
const TASK_ID: felt252 = 'TASK';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;
const ONE_WEEK: u64 = 7 * 24 * 60 * 60;
const START: u64 = 4 * ONE_WEEK; // 4 weeks from now

fn METADATA() -> AchievementMetadata {
    MetadataTrait::new('TITLE', "DESCRIPTION", 'ICON', 10, false, 0, 'GROUP', array![].span(), "")
}

#[test]
fn test_delayed_permanent_achievement_creation() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Achievement with delayed permanent settings
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .achiever
        .create(
            id: ACHIEVEMENT_ID,
            rewarder: context.rewarder,
            start: START,
            end: 0,
            tasks: tasks,
            metadata: METADATA(),
            to_store: true,
        );

    // [Assert] Achievement definition exists
    let definition = store.get_definition(ACHIEVEMENT_ID);
    definition.assert_does_exist();
    assert_eq!(definition.start, START, "Start should be START");
    assert_eq!(definition.end, 0, "End should be 0");
}

#[test]
fn test_delayed_permanent_achievement_completion_once() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Achievement
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .achiever
        .create(
            id: ACHIEVEMENT_ID,
            rewarder: context.rewarder,
            start: START,
            end: 0,
            tasks: tasks,
            metadata: METADATA(),
            to_store: true,
        );

    // [Progress] Before start - should not progress
    set_block_timestamp(START - 1);
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Achievement not progressed (inactive)
    let advancement = store.get_advancement(context.player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(advancement.count, 0, "Advancement should be 0 before start");

    // [Progress] At start time
    set_block_timestamp(START);
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Achievement progressed
    let advancement = store.get_advancement(context.player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(advancement.count, COUNT, "Advancement count should be 50");

    // [Progress] Complete the achievement
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Achievement is completed
    let completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true, "Achievement should be completed");

    // [Progress] Try to progress again after completion
    set_block_timestamp(START + 1000000);
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Achievement remains completed, cannot be completed again
    let completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true, "Achievement should remain completed");
}

#[test]
fn test_delayed_permanent_achievement_claim() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Achievement
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .achiever
        .create(
            id: ACHIEVEMENT_ID,
            rewarder: context.rewarder,
            start: START,
            end: 0,
            tasks: tasks,
            metadata: METADATA(),
            to_store: true,
        );

    // [Progress] Complete the achievement after start
    set_block_timestamp(START + 1000);
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] Achievement is completed but not claimed
    let completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true, "Achievement should be completed");
    assert_eq!(completion.unclaimed, true, "Achievement should not be claimed yet");

    // [Claim] Achievement
    let mut completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    completion.claim();
    store.set_completion(@completion);

    // [Assert] Achievement is claimed
    let completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.unclaimed, false, "Achievement should be claimed");
}

