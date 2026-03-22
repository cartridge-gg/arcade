use quest::models::completion::CompletionTrait;
use quest::models::definition::DefinitionAssert;
use quest::store::StoreTrait;
use quest::tests::contract::ContractTraitDispatcherTrait;
use quest::tests::setup::setup::{METADATA, PLAYER, REWARDER, spawn};
use quest::types::task::TaskTrait;
use starknet::testing::set_block_timestamp;

const QUEST_ID: felt252 = 'QUEST';
const QUEST_A_ID: felt252 = 'QUEST-A';
const QUEST_B_ID: felt252 = 'QUEST-B';
const TASK_ID: felt252 = 'TASK';
const TASK_A_ID: felt252 = 'TASK-A';
const TASK_B_ID: felt252 = 'TASK-B';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;
const ONE_DAY: u64 = 24 * 60 * 60;
const ONE_WEEK: u64 = 7 * ONE_DAY;

#[test]
fn test_questable_create() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, REWARDER(), 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    let definition = store.get_definition(QUEST_ID);
    definition.assert_does_exist();
}

#[test]
fn test_questable_progress_and_complete() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, REWARDER(), 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion.is_completed(), false);

    systems.quester.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion.is_completed(), true);
}

#[test]
fn test_questable_progress_before_start_ignored() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let start: u64 = 4 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, REWARDER(), start, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(start - 1);
    systems.quester.progress(player_id, TASK_ID, COUNT, true);

    set_block_timestamp(start);
    let advancement = store.get_advancement(player_id, QUEST_ID, TASK_ID, 0);
    assert_eq!(advancement.count, 0);
}

#[test]
fn test_questable_progress_after_end_ignored() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let end: u64 = 48 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, REWARDER(), 0, end, 0, 0, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(end + 1);
    systems.quester.progress(player_id, TASK_ID, COUNT, true);
    let advancement = store.get_advancement(player_id, QUEST_ID, TASK_ID, 0);
    assert_eq!(advancement.count, 0);
}

#[test]
fn test_questable_recurring() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let duration: u64 = ONE_DAY;
    let interval: u64 = ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(
            QUEST_ID,
            REWARDER(),
            0,
            0,
            duration,
            interval,
            tasks,
            array![].span(),
            METADATA(),
            true,
        );

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_0 = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion_0.is_completed(), true);

    set_block_timestamp(interval + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_1 = store.get_completion(player_id, QUEST_ID, 1);
    assert_eq!(completion_1.is_completed(), true);
}

#[test]
fn test_questable_claim() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, REWARDER(), 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion.is_completed(), true);
    assert_eq!(completion.unclaimed, true);

    systems.quester.claim(player_id, QUEST_ID, 0);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion.unclaimed, false);
    assert!(systems.quester.is_quest_claimed(player_id, QUEST_ID));
}

#[test]
fn test_questable_is_completed() {
    let (_, systems) = spawn();
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, REWARDER(), 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    // [Assert] Not completed yet
    assert!(!systems.quester.is_completed(player_id, QUEST_ID, 0));

    // [Progress] Complete
    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);

    // [Assert] Completed
    assert!(systems.quester.is_completed(player_id, QUEST_ID, 0));
}

#[test]
fn test_questable_are_completed() {
    let (_, systems) = spawn();
    let player_id: felt252 = PLAYER().into();

    let tasks_a = array![TaskTrait::new('TASK_A', TOTAL, "Task A")].span();
    systems
        .quester
        .create('QUEST_A', REWARDER(), 0, 0, 0, 0, tasks_a, array![].span(), METADATA(), true);
    let tasks_b = array![TaskTrait::new('TASK_B', TOTAL, "Task B")].span();
    systems
        .quester
        .create('QUEST_B', REWARDER(), 0, 0, 0, 0, tasks_b, array![].span(), METADATA(), true);

    // [Assert] Neither completed
    assert!(!systems.quester.are_completed(player_id, array!['QUEST_A', 'QUEST_B'], 0));

    // [Progress] Complete only A
    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK_A', TOTAL, true);
    assert!(!systems.quester.are_completed(player_id, array!['QUEST_A', 'QUEST_B'], 0));

    // [Progress] Complete B too
    systems.quester.progress(player_id, 'TASK_B', TOTAL, true);
    assert!(systems.quester.are_completed(player_id, array!['QUEST_A', 'QUEST_B'], 0));
}

#[test]
fn test_questable_on_completion_hook() {
    let (_, systems) = spawn();
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, REWARDER(), 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);

    assert!(systems.quester.is_quest_completed(player_id, QUEST_ID));
}

#[test]
fn test_questable_conditions() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let tasks_a = array![TaskTrait::new(TASK_A_ID, TOTAL, "Task A")].span();
    systems
        .quester
        .create(QUEST_A_ID, REWARDER(), 0, 0, 0, 0, tasks_a, array![].span(), METADATA(), true);

    let tasks_b = array![TaskTrait::new(TASK_B_ID, TOTAL, "Task B")].span();
    systems
        .quester
        .create(
            QUEST_B_ID,
            REWARDER(),
            0,
            0,
            0,
            0,
            tasks_b,
            array![QUEST_A_ID].span(),
            METADATA(),
            true,
        );

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_B_ID, COUNT, true);
    let advancement_locked = store.get_advancement(player_id, QUEST_B_ID, TASK_B_ID, 0);
    assert_eq!(advancement_locked.count, 0);

    systems.quester.progress(player_id, TASK_A_ID, TOTAL, true);
    let completion_a = store.get_completion(player_id, QUEST_A_ID, 0);
    assert_eq!(completion_a.is_completed(), true);

    let definition_b = store.get_definition(QUEST_B_ID);
    let completion_b = store.get_completion_or_new(player_id, @definition_b, 1000);
    assert_eq!(completion_b.is_unlocked(), true);

    systems.quester.progress(player_id, TASK_B_ID, TOTAL, true);
    let completion_b = store.get_completion(player_id, QUEST_B_ID, 0);
    assert_eq!(completion_b.is_completed(), true);
}
