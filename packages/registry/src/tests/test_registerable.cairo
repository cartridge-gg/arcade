// Starknet imports

// Internal imports

use registry::models::game::Game;
use registry::store::StoreTrait;
use starknet::{ContractAddress, testing};
use crate::tests::mocks::register::IRegisterDispatcherTrait;
use crate::tests::setup::setup::{PLAYER, Systems, spawn};

// Constants

const NAMEPSACE: felt252 = 'NAMESPACE';

pub fn WORLD_ADDRESS() -> ContractAddress {
    'WORLD'.try_into().unwrap()
}

// Helpers

fn register(systems: @Systems) {
    testing::set_contract_address(PLAYER());
    (*systems)
        .registry
        .register_game(
            color: "#123456",
            image: "game_image",
            image_data: "game_image_data",
            external_url: "external_url",
            description: "description",
            name: "game_name",
            attributes: "game_attributes",
            animation_url: "animation_url",
            youtube_url: "youtube_url",
            properties: "properties",
            socials: "game_socials",
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
    let game: Game = store.get_game(1);
    assert_eq!(game.id, 1);
    // [Assert] URI
    let uri = systems.registry.token_uri(game.id.into());
    assert_eq!(uri != Default::default(), true);
}
