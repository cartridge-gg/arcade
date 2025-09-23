// Starknet imports

// Internal imports

use arcade::systems::registry::IRegistryDispatcherTrait;
use arcade::tests::setup::setup::{PLAYER, Systems, spawn};
use registry::models::game::Game;
use registry::store::StoreTrait;
use starknet::{ContractAddress, testing};

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
            world_address: 'WORLD'.try_into().unwrap(),
            namespace: 'NAMESPACE',
            project: "project",
            rpc: "rpc",
            policies: "policies",
            color: "#123456",
            game_image: "game_image",
            edition_image: "edition_image",
            external_url: "external_url",
            description: "description",
            game_name: "game_name",
            edition_name: "edition_name",
            game_attributes: "game_attributes",
            edition_attributes: "edition_attributes",
            animation_url: "animation_url",
            youtube_url: "youtube_url",
            properties: "properties",
            game_socials: "game_socials",
            edition_socials: "edition_socials",
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
