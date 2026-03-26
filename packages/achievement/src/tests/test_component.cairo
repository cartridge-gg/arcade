use starknet::testing::set_block_timestamp;
use crate::models::completion::CompletionTrait;
use crate::models::definition::DefinitionAssert;
use crate::store::StoreTrait;
use crate::tests::contract::ContractTraitDispatcherTrait;
use crate::tests::setup::setup::{PLAYER, spawn};
use crate::types::metadata::{AchievementMetadata, MetadataTrait};
use crate::types::task::TaskTrait;

// Constants

const ACHIEVEMENT_ID: felt252 = 'ACHIEVEMENT';
const TASK_ID: felt252 = 'TASK';
const TOTAL: u128 = 100;
const COUNT: u128 = 50;
const ONE_WEEK: u64 = 7 * 24 * 60 * 60;

fn METADATA() -> AchievementMetadata {
    MetadataTrait::new('TITLE', "DESCRIPTION", 'ICON', 10, false, 0, 'GROUP', array![].span(), "")
}

// Tests - Creation

#[test]
fn test_achievable_create() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, 0, tasks, METADATA(), true);
    let definition = store.get_definition(ACHIEVEMENT_ID);
    definition.assert_does_exist();
}

#[test]
fn test_achievable_create_time_limited() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let end: u64 = 48 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, end, tasks, METADATA(), true);
    let definition = store.get_definition(ACHIEVEMENT_ID);
    definition.assert_does_exist();
    assert_eq!(definition.end, end);
}

#[test]
fn test_achievable_create_delayed() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let start: u64 = 4 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, start, 0, tasks, METADATA(), true);
    let definition = store.get_definition(ACHIEVEMENT_ID);
    definition.assert_does_exist();
    assert_eq!(definition.start, start);
}

// Tests - Completion

#[test]
fn test_achievable_progress_and_complete() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, 0, tasks, METADATA(), true);

    // [Progress] First half
    set_block_timestamp(1000);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), false);

    // [Progress] Second half — completes
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true);
}

#[test]
fn test_achievable_progress_before_start_ignored() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let start: u64 = 4 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, start, 0, tasks, METADATA(), true);

    // [Progress] Before start — ignored
    set_block_timestamp(start - 1);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let advancement = store.get_advancement(player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(advancement.count, 0);

    // [Progress] At start — accepted
    set_block_timestamp(start);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let advancement = store.get_advancement(player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(advancement.count, COUNT);
}

#[test]
fn test_achievable_progress_after_end_ignored() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let end: u64 = 48 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, end, tasks, METADATA(), true);

    // [Progress] Before end — completes
    set_block_timestamp(1000);
    systems.contract.progress(player_id, TASK_ID, TOTAL, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true);

    // [Progress] After end — no effect on already completed
    set_block_timestamp(end + 1);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true);
}

#[test]
fn test_achievable_cannot_complete_twice() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, 0, tasks, METADATA(), true);

    // [Progress] Complete
    set_block_timestamp(1000);
    systems.contract.progress(player_id, TASK_ID, TOTAL, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true);
    let ts = completion.timestamp;

    // [Progress] Again — completion timestamp should not change
    set_block_timestamp(2000);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.timestamp, ts);
}

// Tests - Claim

#[test]
fn test_achievable_claim() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, 0, tasks, METADATA(), true);

    // [Progress] Complete
    set_block_timestamp(1000);
    systems.contract.progress(player_id, TASK_ID, TOTAL, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true);
    assert_eq!(completion.unclaimed, true);

    // [Claim]
    systems.contract.claim(player_id, ACHIEVEMENT_ID);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.unclaimed, false);

    // [Assert] on_claim hook was called
    assert!(systems.contract.is_claimed(player_id, ACHIEVEMENT_ID));
}

// Tests - Queries

#[test]
fn test_achievable_is_completed() {
    let (_, systems) = spawn();
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, 0, tasks, METADATA(), true);

    // [Assert] Not completed yet
    assert!(!systems.contract.achievement_completed(player_id, ACHIEVEMENT_ID));

    // [Progress] Complete
    set_block_timestamp(1000);
    systems.contract.progress(player_id, TASK_ID, TOTAL, true);

    // [Assert] Completed
    assert!(systems.contract.achievement_completed(player_id, ACHIEVEMENT_ID));
}

#[test]
fn test_achievable_are_completed() {
    let (_, systems) = spawn();
    let player_id: felt252 = PLAYER().into();

    let tasks_a = array![TaskTrait::new('TASK_A', TOTAL, "Task A")].span();
    systems.contract.create('ACH_A', 0, 0, tasks_a, METADATA(), true);
    let tasks_b = array![TaskTrait::new('TASK_B', TOTAL, "Task B")].span();
    systems.contract.create('ACH_B', 0, 0, tasks_b, METADATA(), true);

    // [Assert] Neither completed
    assert!(!systems.contract.achievements_completed(player_id, array!['ACH_A', 'ACH_B']));

    // [Progress] Complete only A
    set_block_timestamp(1000);
    systems.contract.progress(player_id, 'TASK_A', TOTAL, true);
    assert!(!systems.contract.achievements_completed(player_id, array!['ACH_A', 'ACH_B']));

    // [Progress] Complete B too
    systems.contract.progress(player_id, 'TASK_B', TOTAL, true);
    assert!(systems.contract.achievements_completed(player_id, array!['ACH_A', 'ACH_B']));
}

// Tests - Time limited with delay (start+end combo)

#[test]
fn test_achievable_time_limited_with_delay() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let start: u64 = 4 * ONE_WEEK;
    let end: u64 = 48 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, start, end, tasks, METADATA(), true);

    // [Progress] Before start — ignored
    set_block_timestamp(start - 1);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let advancement = store.get_advancement(player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(advancement.count, 0);

    // [Progress] At start — accepted
    set_block_timestamp(start);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let advancement = store.get_advancement(player_id, ACHIEVEMENT_ID, TASK_ID);
    assert_eq!(advancement.count, COUNT);

    // [Progress] Complete within window
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true);

    // [Progress] After end — no effect
    set_block_timestamp(end + 1);
    systems.contract.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, ACHIEVEMENT_ID);
    assert_eq!(completion.is_completed(), true);
}

// Tests - Hooks

#[test]
fn test_achievable_on_completion_hook() {
    let (_, systems) = spawn();
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.contract.create(ACHIEVEMENT_ID, 0, 0, tasks, METADATA(), true);

    set_block_timestamp(1000);
    systems.contract.progress(player_id, TASK_ID, TOTAL, true);

    // [Assert] on_completion hook was called
    assert!(systems.contract.is_completed(player_id, ACHIEVEMENT_ID));
}

