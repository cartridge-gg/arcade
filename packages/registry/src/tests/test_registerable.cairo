// Core imports

use core::num::traits::Zero;

// Starknet imports

use starknet::ContractAddress;
use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
use starknet::testing;

// Internal imports

use registry::store::{Store, StoreTrait};
use registry::models::game::{Game, GameTrait};
use registry::models::achievement::{Achievement, AchievementTrait};
use registry::tests::mocks::register::{Register, IRegisterDispatcher, IRegisterDispatcherTrait};
use registry::tests::setup::setup::{spawn, Systems, Context, PLAYER, OWNER};

// Constants

const WORLD_ADDRESS: felt252 = 'WORLD';
const NAMEPSACE: felt252 = 'NAMESPACE';
const PROJECT: felt252 = 'PROJECT';
const PRESET: felt252 = 'PRESET';

// Helpers

fn register(systems: @Systems) {
    testing::set_contract_address(PLAYER());
    (*systems)
        .register
        .register(
            WORLD_ADDRESS,
            NAMEPSACE,
            PROJECT,
            PRESET,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
        );
}

// Tests

#[test]
fn test_registrable_register() {
    // [Setup]
    let (world, systems, _context) = spawn();
    // [Register] Game
    register(@systems);
    // [Assert] Game
    let store = StoreTrait::new(world);
    let game: Game = store.get_game(WORLD_ADDRESS, NAMEPSACE);
    assert_eq!(game.world_address, WORLD_ADDRESS);
    assert_eq!(game.namespace, NAMEPSACE);
    assert_eq!(game.published, false);
    assert_eq!(game.whitelisted, false);
    assert_eq!(game.karma, 0);
    assert_eq!(
        game.metadata,
        "{\"color\":\"\",\"name\":\"\",\"description\":\"\",\"image\":\"\",\"banner\":\"\"}"
    );
    assert_eq!(
        game.socials,
        "{\"discord\":\"\",\"telegram\":\"\",\"twitter\":\"\",\"youtube\":\"\",\"website\":\"\"}"
    );
    assert_eq!(game.owner, PLAYER().into());
}

#[test]
fn test_registrable_update() {
    // [Setup]
    let (world, systems, _context) = spawn();
    register(@systems);
    // [Update] Game
    let color = Option::Some('#123456');
    systems
        .register
        .update(
            WORLD_ADDRESS,
            NAMEPSACE,
            PROJECT,
            PRESET,
            color,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
            Option::None,
        );
    // [Assert] Game
    let store = StoreTrait::new(world);
    let game = store.get_game(WORLD_ADDRESS, NAMEPSACE);
    assert_eq!(
        game.metadata,
        "{\"color\":\"#123456\",\"name\":\"\",\"description\":\"\",\"image\":\"\",\"banner\":\"\"}"
    );
}

#[test]
fn test_registrable_publish() {
    // [Setup]
    let (world, systems, _context) = spawn();
    register(@systems);
    systems.register.publish(WORLD_ADDRESS, NAMEPSACE);
    // [Assert] Game
    let store = StoreTrait::new(world);
    let game = store.get_game(WORLD_ADDRESS, NAMEPSACE);
    assert_eq!(game.published, true);
}

#[test]
fn test_registrable_whitelist() {
    // [Setup]
    let (world, systems, _context) = spawn();
    register(@systems);
    systems.register.publish(WORLD_ADDRESS, NAMEPSACE);
    testing::set_contract_address(OWNER());
    systems.register.whitelist(WORLD_ADDRESS, NAMEPSACE);
    // [Assert] Game
    let store = StoreTrait::new(world);
    let game = store.get_game(WORLD_ADDRESS, NAMEPSACE);
    assert_eq!(game.whitelisted, true);
}
