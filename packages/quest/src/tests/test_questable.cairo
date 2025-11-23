// Imports

use starknet::testing::set_block_timestamp;
use crate::models::advancement::AdvancementTrait;
use crate::models::completion::{CompletionAssert, CompletionTrait};
use crate::models::definition::{DefinitionAssert, DefinitionTrait};
use crate::store::StoreTrait;
use crate::tests::mocks::quester::IQuesterDispatcherTrait;
use crate::tests::setup::setup::spawn_game;
use crate::types::task::TaskTrait;

// Constants

const TASK_ID: felt252 = 'TASK';
const HIDDEN: bool = false;
const INDEX: u8 = 0;
const ONE_DAY: u64 = 24 * 60 * 60;
const ONE_WEEK: u64 = 7 * ONE_DAY;
const START: u64 = 4 * ONE_WEEK; // 4 weeks
const END: u64 = 48 * ONE_WEEK; // 48 weeks
const DURATION: u64 = 1 * ONE_DAY; // 1 day
const INTERVAL: u64 = 1 * ONE_WEEK; // 1 week
const COUNT: u128 = 50;
const TOTAL: u128 = 100;

fn NAME() -> ByteArray {
    "Name"
}

fn DESCRIPTION() -> ByteArray {
    "Description"
}

// Tests

#[test]
fn test_questable_create() {
    spawn_game();
    // [Setup] World
    let (world, systems, context) = spawn_game();
    let store = StoreTrait::new(world);
    // [Create] Quest 1
    let quest_one = 'QUEST-1';
    let tasks = array![TaskTrait::new(TASK_ID, TOTAL, "Description")].span();
    systems
        .quester
        .create(
            quest_one,
            context.rewarder,
            START,
            END,
            DURATION,
            INTERVAL,
            tasks,
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
    // [Create] Quest 2
    let quest_two = 'QUEST-2';
    systems
        .quester
        .create(
            quest_two,
            context.rewarder,
            START,
            END,
            DURATION,
            INTERVAL,
            tasks,
            conditions: array![quest_one].span(),
            hidden: HIDDEN,
            name: NAME(),
            description: DESCRIPTION(),
            index: Option::None,
            group: Option::None,
            icon: Option::None,
            data: Option::None,
            to_store: true,
        );
    // [Progress] Task
    set_block_timestamp(START);
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL / 2, to_store: true);
    // [Assert] Quest 1 not completed
    let definition = store.get_definition(quest_one);
    let interval_id = definition.compute_interval_id(START);
    let completion = store.get_completion(context.player_id, quest_one, interval_id);
    let advancement = store.get_advancement(context.player_id, quest_one, TASK_ID, interval_id);
    definition.assert_does_exist();
    assert(!completion.is_undefined(), 'Q1: Completion is undefined');
    assert(!completion.is_completed(), 'Q1: Completion is completed');
    assert(!advancement.is_completed(), 'Q1: Advancement is completed');
    // [Assert] Quest 2 is locked
    let definition = store.get_definition(quest_two);
    let interval_id = definition.compute_interval_id(START);
    let completion = store.get_completion(context.player_id, quest_two, interval_id);
    assert(!completion.is_unlocked(), 'Q2: Completion is unlocked');
    // [Progress] Task
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL / 2, to_store: true);
    // [Assert] Quest 1 is completed not claimed
    let definition = store.get_definition(quest_one);
    let interval_id = definition.compute_interval_id(START);
    let completion = store.get_completion(context.player_id, quest_one, interval_id);
    let advancement = store.get_advancement(context.player_id, quest_one, TASK_ID, interval_id);
    definition.assert_does_exist();
    assert(!completion.is_undefined(), 'Q1: Completion is undefined');
    assert(completion.is_completed(), 'Q1: Completion not completed');
    assert(advancement.is_completed(), 'Q1: Advancement not completed');
    // [Assert] Quest 2 is unlocked
    let definition = store.get_definition(quest_two);
    let interval_id = definition.compute_interval_id(START);
    let completion = store.get_completion(context.player_id, quest_two, interval_id);
    assert(completion.is_unlocked(), 'Q2: Completion is locked');
    // [Progress] Task
    systems
        .quester
        .progress(player_id: context.player_id, task_id: TASK_ID, count: TOTAL, to_store: true);
    // [Assert] Quest 2 is completed not claimed
    let definition = store.get_definition(quest_two);
    let interval_id = definition.compute_interval_id(START);
    let completion = store.get_completion(context.player_id, quest_two, interval_id);
    let advancement = store.get_advancement(context.player_id, quest_two, TASK_ID, interval_id);
    definition.assert_does_exist();
    assert(!completion.is_undefined(), 'Q2: Completion is undefined');
    assert(completion.is_completed(), 'Q2: Completion not completed');
    assert(advancement.is_completed(), 'Q2: Advancement not completed');
    assert(completion.unclaimed, 'Q2: Completion not claimed');
    // [Claim] Quest 2
    systems
        .quester
        .claim(player_id: context.player_id, quest_id: quest_two, interval_id: interval_id);
    // [Assert] Quest 2 is completed claimed
    let definition = store.get_definition(quest_two);
    let interval_id = definition.compute_interval_id(START);
    let completion = store.get_completion(context.player_id, quest_two, interval_id);
    assert(!completion.unclaimed, 'Q2: Completion not claimed');
}

