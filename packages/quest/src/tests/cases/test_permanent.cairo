//! Test case 1: Permanent quest
//!
//! Settings:
//! - Start = 0
//! - End = 0
//! - Duration = 0
//! - Interval = 0
//!
//! Expected behavior:
//! - Quest starts immediately and lasts forever
//! - Quest is always active regardless of current time
//! - Can only be completed once per player (interval_id is always 0)

use starknet::testing::set_block_timestamp;
use crate::models::advancement::AdvancementTrait;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::{DefinitionAssert, DefinitionTrait};
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
use crate::types::task::TaskTrait;

// Constants

const QUEST_ID: felt252 = 'PERMANENT';
const TASK_ID: felt252 = 'TASK';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;

fn NAME() -> ByteArray {
    "Permanent Quest"
}

fn DESCRIPTION() -> ByteArray {
    "A quest that lasts forever"
}

#[test]
fn test_permanent_quest_creation() {
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);

    // [Create] Quest with permanent settings
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Task Description")].span();
    systems
        .quester
        .create(
            id: QUEST_ID,
            rewarder: context.rewarder,
            start: 0,
            end: 0,
            duration: 0,
            interval: 0,
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
    assert_eq!(definition.duration, 0, "Duration should be 0");
    assert_eq!(definition.interval, 0, "Interval should be 0");
}

#[test]
fn test_permanent_quest_completion_once() {
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
            duration: 0,
            interval: 0,
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

    // [Progress] First half
    set_block_timestamp(1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Quest not completed yet
    let definition = store.get_definition(QUEST_ID);
    let interval_id = definition.compute_interval_id(1000);
    let completion = store.get_completion(context.player_id, QUEST_ID, interval_id);
    let advancement = store.get_advancement(context.player_id, QUEST_ID, TASK_ID, interval_id);
    assert_eq!(completion.is_completed(), false, "Quest should not be completed yet");
    assert_eq!(advancement.count, COUNT, "Advancement count should be 50");

    // [Progress] Complete the quest
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Quest is completed
    let completion = store.get_completion(context.player_id, QUEST_ID, interval_id);
    let advancement = store.get_advancement(context.player_id, QUEST_ID, TASK_ID, interval_id);
    assert_eq!(completion.is_completed(), true, "Quest should be completed");
    assert_eq!(advancement.is_completed(), true, "Advancement should be completed");
    assert_eq!(completion.timestamp > 0, true, "Completion timestamp should be set");

    // [Progress] Try to progress again
    set_block_timestamp(2000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: COUNT, to_store: true);

    // [Assert] Quest remains completed, cannot be completed again
    let completion = store.get_completion(context.player_id, QUEST_ID, interval_id);
    assert_eq!(completion.is_completed(), true, "Quest should remain completed");
    // Timestamp should not change
    assert_eq!(completion.timestamp <= 2000, true, "Completion timestamp should not change");
}

#[test]
fn test_permanent_quest_claim() {
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
            duration: 0,
            interval: 0,
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

    // [Progress] Complete the quest
    set_block_timestamp(1000);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);

    // [Assert] Quest is completed but not claimed
    let definition = store.get_definition(QUEST_ID);
    let interval_id = definition.compute_interval_id(1000);
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

