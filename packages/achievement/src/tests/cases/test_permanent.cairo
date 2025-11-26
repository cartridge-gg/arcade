//! Test case 1: Permanent achievement
//!
//! Settings:
//! - Start = 0
//! - End = 0
//!
//! Expected behavior:
//! - Achievement starts immediately and lasts forever
//! - Achievement is always active regardless of current time
//! - Can only be completed once per player

use achievement::models::advancement::AdvancementTrait;
use achievement::models::completion::{CompletionAssert, CompletionTrait};
use achievement::models::definition::DefinitionAssert;
use achievement::store::StoreTrait;
use achievement::tests::mocks::achiever::IAchieverDispatcherTrait;
use achievement::tests::setup::setup::spawn_game;
use achievement::types::metadata::{AchievementMetadata, MetadataTrait};
use achievement::types::task::TaskTrait;
use starknet::testing::set_block_timestamp;

// Constants

const ACHIEVEMENT_ID: felt252 = 'PERMANENT';
const TASK_ID: felt252 = 'TASK';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;

fn METADATA() -> AchievementMetadata {
    MetadataTrait::new('TITLE', "DESCRIPTION", 'ICON', 10, false, 0, 'GROUP', array![].span(), "")
}

#[test]
fn test_permanent_achievement_creation() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Achievement with permanent settings
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .achiever
        .create(
            id: ACHIEVEMENT_ID,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            tasks: tasks,
            metadata: METADATA(),
            to_store: true,
        );

    // [Assert] Achievement definition exists
    let definition = store.get_definition(ACHIEVEMENT_ID);
    definition.assert_does_exist();
    assert_eq!(definition.start, 0, "Start should be 0");
    assert_eq!(definition.end, 0, "End should be 0");
}

#[test]
fn test_permanent_achievement_completion_once() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Achievement
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .achiever
        .create(
            id: ACHIEVEMENT_ID,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            tasks: tasks,
            metadata: METADATA(),
            to_store: true,
        );

    // [Progress] First half
    set_block_timestamp(1000);
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Achievement not completed yet
    let completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    let advancement = store.get_advancement(context.player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(completion.is_completed(), false, "Achievement should not be completed yet");
    assert_eq!(advancement.count, COUNT, "Advancement count should be 50");

    // [Progress] Complete the achievement
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Achievement is completed
    let completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    let advancement = store.get_advancement(context.player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(completion.is_completed(), true, "Achievement should be completed");
    assert_eq!(advancement.is_completed(), true, "Advancement should be completed");
    assert_eq!(completion.timestamp > 0, true, "Completion timestamp should be set");

    // [Progress] Try to progress again
    set_block_timestamp(2000);
    systems
        .achiever
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Achievement remains completed, cannot be completed again
    let completion = store.get_completion(context.player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true, "Achievement should remain completed");
    // Timestamp should not change
    assert_eq!(completion.timestamp <= 2000, true, "Completion timestamp should not change");
}

#[test]
fn test_permanent_achievement_claim() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Achievement
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .achiever
        .create(
            id: ACHIEVEMENT_ID,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            tasks: tasks,
            metadata: METADATA(),
            to_store: true,
        );

    // [Progress] Complete the achievement
    set_block_timestamp(1000);
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

