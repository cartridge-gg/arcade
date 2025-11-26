// Dojo imports

use achievement::tests::mocks::achiever::IAchieverDispatcherTrait;
use achievement::tests::setup::setup::{clear_events, spawn_game};
use achievement::types::metadata::MetadataTrait;
use achievement::types::reward::RewardTrait;

// Internal imports

use achievement::types::task::TaskTrait;
use dojo::world::world::Event;

// Constants

const TROPHY_ID: felt252 = 'TROPHY';
const TASK_ID: felt252 = 'TASK';
const HIDDEN: bool = false;
const INDEX: u8 = 0;
const POINTS: u16 = 10;
const START: u64 = 100;
const END: u64 = 200;
const TOTAL: u128 = 100;
const COUNT: u128 = 1;
const GROUP: felt252 = 'Group';
const ICON: felt252 = 'fa-khanda';
const TITLE: felt252 = 'Title';

// Tests

#[test]
fn test_achievable_create() {
    let (world, systems, context) = spawn_game();
    clear_events(world.dispatcher.contract_address);
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    let rewards = array![RewardTrait::new("NAME", "DESCRIPTION", "ICON")].span();
    let metadata = MetadataTrait::new(
        TITLE, "DESCRIPTION", ICON, POINTS, HIDDEN, INDEX, GROUP, rewards, "",
    );
    systems.achiever.create(TROPHY_ID, context.rewarder, START, END, tasks, metadata, false);
    let contract_event = starknet::testing::pop_log::<Event>(world.dispatcher.contract_address)
        .unwrap();
    if let Event::EventEmitted(event) = contract_event {
        assert(*event.keys.at(0) == TROPHY_ID, 'Invalid trophy id');
        assert(*event.values.at(0) == 0, 'Invalid hidden');
        assert(*event.values.at(1) == INDEX.into(), 'Invalid index');
        assert(*event.values.at(2) == POINTS.into(), 'Invalid points');
        assert(*event.values.at(3) == START.into(), 'Invalid start');
        assert(*event.values.at(4) == END.into(), 'Invalid end');
        assert(*event.values.at(5) == GROUP, 'Invalid group');
        assert(*event.values.at(6) == ICON, 'Invalid icon');
        assert(*event.values.at(7) == TITLE, 'Invalid title');
        assert(*event.values.at(8) == 0, 'Invalid data');
        assert(*event.values.at(10) == 11, 'Invalid task count');
        assert(*event.values.at(11) == 1, 'Invalid task count');
        assert(*event.values.at(12) == TASK_ID, 'Invalid task id');
        assert(*event.values.at(13) == TOTAL.into(), 'Invalid task total');
        assert(*event.values.at(14) == 0, 'Invalid task time');
        assert(*event.values.at(15) == 'Description', 'Invalid task description');
        assert(*event.values.at(16) == 11, 'Invalid task points');
    }
}
#[test]
fn test_achievable_progress() {
    let (world, systems, context) = spawn_game();
    clear_events(world.dispatcher.contract_address);
    systems.achiever.progress(context.player_id, TASK_ID, COUNT, true);
    let contract_event = starknet::testing::pop_log::<Event>(world.dispatcher.contract_address)
        .unwrap();
    if let Event::EventEmitted(event) = contract_event {
        assert(*event.keys.at(0) == context.player_id, 'Invalid player id');
        assert(*event.keys.at(1) == TASK_ID, 'Invalid task id');
        assert(*event.values.at(0) == COUNT.into(), 'Invalid count');
        assert(*event.values.at(1) == 0, 'Invalid time');
    }
}

