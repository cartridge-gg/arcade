use starknet::testing::set_block_timestamp;
use crate::models::completion::CompletionTrait;
use crate::models::definition::DefinitionAssert;
use crate::store::StoreTrait;
use crate::tests::contract::ContractTraitDispatcherTrait;
use crate::tests::setup::setup::{METADATA, PLAYER, spawn};
use crate::types::task::TaskTrait;

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
    systems.quester.create(QUEST_ID, 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    let definition = store.get_definition(QUEST_ID);
    definition.assert_does_exist();
}

#[test]
fn test_questable_progress_and_complete() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.quester.create(QUEST_ID, 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

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
    systems.quester.create(QUEST_ID, start, 0, 0, 0, tasks, array![].span(), METADATA(), true);

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
    systems.quester.create(QUEST_ID, 0, end, 0, 0, tasks, array![].span(), METADATA(), true);

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
        .create(QUEST_ID, 0, 0, duration, interval, tasks, array![].span(), METADATA(), true);

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
    systems.quester.create(QUEST_ID, 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

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
    systems.quester.create(QUEST_ID, 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

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
    systems.quester.create('QUEST_A', 0, 0, 0, 0, tasks_a, array![].span(), METADATA(), true);
    let tasks_b = array![TaskTrait::new('TASK_B', TOTAL, "Task B")].span();
    systems.quester.create('QUEST_B', 0, 0, 0, 0, tasks_b, array![].span(), METADATA(), true);

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
    systems.quester.create(QUEST_ID, 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

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
    systems.quester.create(QUEST_A_ID, 0, 0, 0, 0, tasks_a, array![].span(), METADATA(), true);

    let tasks_b = array![TaskTrait::new(TASK_B_ID, TOTAL, "Task B")].span();
    systems
        .quester
        .create(QUEST_B_ID, 0, 0, 0, 0, tasks_b, array![QUEST_A_ID].span(), METADATA(), true);

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

#[test]
fn test_questable_time_limited_with_delay() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let start: u64 = 4 * ONE_WEEK;
    let end: u64 = 48 * ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.quester.create(QUEST_ID, start, end, 0, 0, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(start - 1);
    systems.quester.progress(player_id, TASK_ID, COUNT, true);
    let advancement_before_start = store.get_advancement(player_id, QUEST_ID, TASK_ID, 0);
    assert_eq!(advancement_before_start.count, 0);

    set_block_timestamp(start);
    systems.quester.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion.is_completed(), false);

    set_block_timestamp(start + 1);
    systems.quester.progress(player_id, TASK_ID, COUNT, true);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion.is_completed(), true);

    set_block_timestamp(end + 1);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let advancement_after_end = store.get_advancement(player_id, QUEST_ID, TASK_ID, 0);
    assert_eq!(advancement_after_end.count, TOTAL);
}

#[test]
fn test_questable_recurring_multiple_completions() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let duration: u64 = ONE_DAY;
    let interval: u64 = ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, 0, 0, duration, interval, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_0 = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion_0.is_completed(), true);
    assert_eq!(completion_0.interval_id, 0);

    set_block_timestamp(interval + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_1 = store.get_completion(player_id, QUEST_ID, 1);
    assert_eq!(completion_1.is_completed(), true);
    assert_eq!(completion_1.interval_id, 1);

    set_block_timestamp((2 * interval) + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_2 = store.get_completion(player_id, QUEST_ID, 2);
    assert_eq!(completion_2.is_completed(), true);
    assert_eq!(completion_2.interval_id, 2);
}

#[test]
fn test_questable_recurring_claim_multiple() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let duration: u64 = ONE_DAY;
    let interval: u64 = ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, 0, 0, duration, interval, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    systems.quester.claim(player_id, QUEST_ID, 0);
    let completion_0 = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion_0.unclaimed, false);

    set_block_timestamp(interval + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    systems.quester.claim(player_id, QUEST_ID, 1);
    let completion_1 = store.get_completion(player_id, QUEST_ID, 1);
    assert_eq!(completion_1.unclaimed, false);
}

#[test]
fn test_questable_recurring_with_delay() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let start: u64 = 4 * ONE_WEEK;
    let duration: u64 = ONE_DAY;
    let interval: u64 = ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, start, 0, duration, interval, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(start - 1);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let advancement_before_start = store.get_advancement(player_id, QUEST_ID, TASK_ID, 0);
    assert_eq!(advancement_before_start.count, 0);

    set_block_timestamp(start + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_0 = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion_0.is_completed(), true);

    set_block_timestamp(start + interval + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_1 = store.get_completion(player_id, QUEST_ID, 1);
    assert_eq!(completion_1.is_completed(), true);
}

#[test]
fn test_questable_recurring_time_limited() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let end: u64 = 48 * ONE_WEEK;
    let duration: u64 = ONE_DAY;
    let interval: u64 = ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, 0, end, duration, interval, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_0 = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion_0.is_completed(), true);

    set_block_timestamp(interval + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_1 = store.get_completion(player_id, QUEST_ID, 1);
    assert_eq!(completion_1.is_completed(), true);

    set_block_timestamp(end + 1);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let advancement_after_end = store.get_advancement(player_id, QUEST_ID, TASK_ID, 2);
    assert_eq!(advancement_after_end.count, 0);
}

#[test]
fn test_questable_recurring_time_limited_with_delay() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let start: u64 = 4 * ONE_WEEK;
    let end: u64 = 48 * ONE_WEEK;
    let duration: u64 = ONE_DAY;
    let interval: u64 = ONE_WEEK;
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(QUEST_ID, start, end, duration, interval, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(start - 1);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let advancement_before_start = store.get_advancement(player_id, QUEST_ID, TASK_ID, 0);
    assert_eq!(advancement_before_start.count, 0);

    set_block_timestamp(start + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_0 = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion_0.is_completed(), true);

    set_block_timestamp(start + interval + 1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion_1 = store.get_completion(player_id, QUEST_ID, 1);
    assert_eq!(completion_1.is_completed(), true);

    set_block_timestamp(end + 1);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let advancement_after_end = store.get_advancement(player_id, QUEST_ID, TASK_ID, 2);
    assert_eq!(advancement_after_end.count, 0);
}

#[test]
fn test_questable_cannot_complete_twice() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems.quester.create(QUEST_ID, 0, 0, 0, 0, tasks, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    let first_timestamp = completion.timestamp;
    assert_eq!(first_timestamp, 1000);

    set_block_timestamp(2000);
    systems.quester.progress(player_id, TASK_ID, TOTAL, true);
    let completion = store.get_completion(player_id, QUEST_ID, 0);
    assert_eq!(completion.timestamp, first_timestamp);
}

#[test]
fn test_questable_conditions_linear_chain() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let tasks_a = array![TaskTrait::new('TASK-A1', TOTAL, "Task A")].span();
    systems.quester.create('A1', 0, 0, 0, 0, tasks_a, array![].span(), METADATA(), true);

    let tasks_b = array![TaskTrait::new('TASK-B1', TOTAL, "Task B")].span();
    systems.quester.create('B1', 0, 0, 0, 0, tasks_b, array!['A1'].span(), METADATA(), true);

    let tasks_c = array![TaskTrait::new('TASK-C1', TOTAL, "Task C")].span();
    systems.quester.create('C1', 0, 0, 0, 0, tasks_c, array!['B1'].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK-B1', COUNT, true);
    let advancement_locked = store.get_advancement(player_id, 'B1', 'TASK-B1', 0);
    assert_eq!(advancement_locked.count, 0);

    systems.quester.progress(player_id, 'TASK-A1', TOTAL, true);
    let definition_b = store.get_definition('B1');
    let completion_b = store.get_completion_or_new(player_id, @definition_b, 1000);
    assert_eq!(completion_b.is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-B1', TOTAL, true);
    let definition_c = store.get_definition('C1');
    let completion_c = store.get_completion_or_new(player_id, @definition_c, 1000);
    assert_eq!(completion_c.is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-C1', TOTAL, true);
    assert_eq!(store.get_completion(player_id, 'A1', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'B1', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'C1', 0).is_completed(), true);
}

#[test]
fn test_questable_conditions_diamond() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let tasks_a = array![TaskTrait::new('TASK-A2', TOTAL, "Task A")].span();
    systems.quester.create('A2', 0, 0, 0, 0, tasks_a, array![].span(), METADATA(), true);

    let tasks_b = array![TaskTrait::new('TASK-B2', TOTAL, "Task B")].span();
    systems.quester.create('B2', 0, 0, 0, 0, tasks_b, array!['A2'].span(), METADATA(), true);

    let tasks_c = array![TaskTrait::new('TASK-C2', TOTAL, "Task C")].span();
    systems.quester.create('C2', 0, 0, 0, 0, tasks_c, array!['A2'].span(), METADATA(), true);

    let tasks_d = array![TaskTrait::new('TASK-D2', TOTAL, "Task D")].span();
    systems.quester.create('D2', 0, 0, 0, 0, tasks_d, array!['B2', 'C2'].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK-A2', TOTAL, true);

    let definition_b = store.get_definition('B2');
    let definition_c = store.get_definition('C2');
    assert_eq!(store.get_completion_or_new(player_id, @definition_b, 1000).is_unlocked(), true);
    assert_eq!(store.get_completion_or_new(player_id, @definition_c, 1000).is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-B2', TOTAL, true);
    let definition_d = store.get_definition('D2');
    let completion_d = store.get_completion_or_new(player_id, @definition_d, 1000);
    assert_eq!(completion_d.is_unlocked(), false);

    systems.quester.progress(player_id, 'TASK-C2', TOTAL, true);
    let completion_d = store.get_completion_or_new(player_id, @definition_d, 1000);
    assert_eq!(completion_d.is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-D2', TOTAL, true);
    assert_eq!(store.get_completion(player_id, 'D2', 0).is_completed(), true);
}

#[test]
fn test_questable_conditions_independent() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let tasks_a = array![TaskTrait::new('TASK-A3', TOTAL, "Task A")].span();
    systems.quester.create('A3', 0, 0, 0, 0, tasks_a, array![].span(), METADATA(), true);

    let tasks_b = array![TaskTrait::new('TASK-B3', TOTAL, "Task B")].span();
    systems.quester.create('B3', 0, 0, 0, 0, tasks_b, array![].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK-A3', TOTAL, true);
    systems.quester.progress(player_id, 'TASK-B3', TOTAL, true);

    assert_eq!(store.get_completion(player_id, 'A3', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'B3', 0).is_completed(), true);
}

#[test]
fn test_questable_conditions_tree() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let task_root = array![TaskTrait::new('TASK-ROOT', TOTAL, "Task Root")].span();
    systems.quester.create('ROOT', 0, 0, 0, 0, task_root, array![].span(), METADATA(), true);

    let task_left = array![TaskTrait::new('TASK-LEFT', TOTAL, "Task Left")].span();
    systems.quester.create('LEFT', 0, 0, 0, 0, task_left, array!['ROOT'].span(), METADATA(), true);

    let task_right = array![TaskTrait::new('TASK-RIGHT', TOTAL, "Task Right")].span();
    systems
        .quester
        .create('RIGHT', 0, 0, 0, 0, task_right, array!['ROOT'].span(), METADATA(), true);

    let task_ll = array![TaskTrait::new('TASK-LL', TOTAL, "Task LL")].span();
    systems.quester.create('LL', 0, 0, 0, 0, task_ll, array!['LEFT'].span(), METADATA(), true);

    let task_lr = array![TaskTrait::new('TASK-LR', TOTAL, "Task LR")].span();
    systems.quester.create('LR', 0, 0, 0, 0, task_lr, array!['LEFT'].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK-ROOT', TOTAL, true);

    let definition_left = store.get_definition('LEFT');
    let definition_right = store.get_definition('RIGHT');
    assert_eq!(store.get_completion_or_new(player_id, @definition_left, 1000).is_unlocked(), true);
    assert_eq!(store.get_completion_or_new(player_id, @definition_right, 1000).is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-LEFT', TOTAL, true);
    let definition_ll = store.get_definition('LL');
    let definition_lr = store.get_definition('LR');
    assert_eq!(store.get_completion_or_new(player_id, @definition_ll, 1000).is_unlocked(), true);
    assert_eq!(store.get_completion_or_new(player_id, @definition_lr, 1000).is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-RIGHT', TOTAL, true);
    systems.quester.progress(player_id, 'TASK-LL', TOTAL, true);
    systems.quester.progress(player_id, 'TASK-LR', TOTAL, true);

    assert_eq!(store.get_completion(player_id, 'ROOT', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'LEFT', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'RIGHT', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'LL', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'LR', 0).is_completed(), true);
}

#[test]
fn test_questable_conditions_convergent() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let task_a = array![TaskTrait::new('TASK-A4', TOTAL, "Task A")].span();
    systems.quester.create('A4', 0, 0, 0, 0, task_a, array![].span(), METADATA(), true);

    let task_b = array![TaskTrait::new('TASK-B4', TOTAL, "Task B")].span();
    systems.quester.create('B4', 0, 0, 0, 0, task_b, array![].span(), METADATA(), true);

    let task_c = array![TaskTrait::new('TASK-C4', TOTAL, "Task C")].span();
    systems.quester.create('C4', 0, 0, 0, 0, task_c, array!['A4', 'B4'].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK-A4', TOTAL, true);
    let definition_c = store.get_definition('C4');
    let completion_c = store.get_completion_or_new(player_id, @definition_c, 1000);
    assert_eq!(completion_c.is_unlocked(), false);

    systems.quester.progress(player_id, 'TASK-B4', TOTAL, true);
    let completion_c = store.get_completion_or_new(player_id, @definition_c, 1000);
    assert_eq!(completion_c.is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-C4', TOTAL, true);
    assert_eq!(store.get_completion(player_id, 'C4', 0).is_completed(), true);
}

#[test]
fn test_questable_conditions_multiple_parents() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let task_a = array![TaskTrait::new('TASK-A5', TOTAL, "Task A")].span();
    systems.quester.create('A5', 0, 0, 0, 0, task_a, array![].span(), METADATA(), true);

    let task_b = array![TaskTrait::new('TASK-B5', TOTAL, "Task B")].span();
    systems.quester.create('B5', 0, 0, 0, 0, task_b, array![].span(), METADATA(), true);

    let task_c = array![TaskTrait::new('TASK-C5', TOTAL, "Task C")].span();
    systems.quester.create('C5', 0, 0, 0, 0, task_c, array!['A5', 'B5'].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK-A5', TOTAL, true);
    let definition_c = store.get_definition('C5');
    let completion_c = store.get_completion_or_new(player_id, @definition_c, 1000);
    assert_eq!(completion_c.is_unlocked(), false);

    systems.quester.progress(player_id, 'TASK-B5', TOTAL, true);
    let completion_c = store.get_completion_or_new(player_id, @definition_c, 1000);
    assert_eq!(completion_c.is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-C5', TOTAL, true);
    assert_eq!(store.get_completion(player_id, 'C5', 0).is_completed(), true);
}

#[test]
fn test_questable_conditions_single_parent_multiple_children() {
    let (world, systems) = spawn();
    let store = StoreTrait::new(world);
    let player_id: felt252 = PLAYER().into();

    let task_a = array![TaskTrait::new('TASK-A6', TOTAL, "Task A")].span();
    systems.quester.create('A6', 0, 0, 0, 0, task_a, array![].span(), METADATA(), true);

    let task_b = array![TaskTrait::new('TASK-B6', TOTAL, "Task B")].span();
    systems.quester.create('B6', 0, 0, 0, 0, task_b, array!['A6'].span(), METADATA(), true);

    let task_c = array![TaskTrait::new('TASK-C6', TOTAL, "Task C")].span();
    systems.quester.create('C6', 0, 0, 0, 0, task_c, array!['A6'].span(), METADATA(), true);

    let task_d = array![TaskTrait::new('TASK-D6', TOTAL, "Task D")].span();
    systems.quester.create('D6', 0, 0, 0, 0, task_d, array!['A6'].span(), METADATA(), true);

    set_block_timestamp(1000);
    systems.quester.progress(player_id, 'TASK-A6', TOTAL, true);

    let definition_b = store.get_definition('B6');
    let definition_c = store.get_definition('C6');
    let definition_d = store.get_definition('D6');
    assert_eq!(store.get_completion_or_new(player_id, @definition_b, 1000).is_unlocked(), true);
    assert_eq!(store.get_completion_or_new(player_id, @definition_c, 1000).is_unlocked(), true);
    assert_eq!(store.get_completion_or_new(player_id, @definition_d, 1000).is_unlocked(), true);

    systems.quester.progress(player_id, 'TASK-B6', TOTAL, true);
    systems.quester.progress(player_id, 'TASK-C6', TOTAL, true);
    systems.quester.progress(player_id, 'TASK-D6', TOTAL, true);

    assert_eq!(store.get_completion(player_id, 'B6', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'C6', 0).is_completed(), true);
    assert_eq!(store.get_completion(player_id, 'D6', 0).is_completed(), true);
}
