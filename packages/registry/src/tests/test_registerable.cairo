// Starknet imports

use starknet::{ContractAddress, testing};

// Internal imports

use registry::store::StoreTrait;
use registry::models::game::Game;
use registry::tests::mocks::register::IRegisterDispatcherTrait;
use registry::tests::setup::setup::{spawn, Systems, PLAYER};

// Constants

const NAMEPSACE: felt252 = 'NAMESPACE';

pub fn WORLD_ADDRESS() -> ContractAddress {
    starknet::contract_address_const::<'WORLD'>()
}

// Helpers

fn register(systems: @Systems) {
    testing::set_contract_address(PLAYER());
    (*systems)
        .register
        .register_game(
            color: "#123456",
            image: "image",
            image_data: "image_data",
            external_url: "external_url",
            description: "description",
            name: "name",
            attributes: "attributes",
            animation_url: "animation_url",
            youtube_url: "youtube_url",
            properties: "properties",
            socials: "socials",
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
    let uri = systems.register.token_uri(game.id.into());
    assert_eq!(uri != Default::default(), true);
}
