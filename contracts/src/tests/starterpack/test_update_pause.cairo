// Internal imports

use arcade::systems::starterpack::{
    IAdministrationDispatcherTrait, IStarterpackRegistryDispatcherTrait, StarterPackMetadata,
};
use arcade::tests::setup::setup::{OWNER, RECEIVER, spawn};
use starknet::testing;
use starterpack::models::index::Starterpack;
use starterpack::store::{StarterpackStoreTrait, StoreTrait};
use starterpack::types::status::Status;

// Constants

const PROTOCOL_FEE: u8 = 5; // 5%
const REFERRAL_PERCENTAGE: u8 = 10; // 10%
const PRICE: u256 = 1_000_000_000_000_000_000; // 1 token

// Tests

#[test]
fn test_sp_update() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Pack", description: "Test", image_uri: "https://example.com/image.png",
    };
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: false,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Update] Starterpack settings
    let new_metadata = StarterPackMetadata {
        name: "Updated Pack",
        description: "Updated description",
        image_uri: "https://example.com/new_image.png",
    };
    let new_price = PRICE * 2;
    let new_referral = 20_u8;
    systems
        .starterpack
        .update(
            starterpack_id: starterpack_id,
            implementation: systems.starterpack_impl,
            referral_percentage: new_referral,
            reissuable: true,
            price: new_price,
            payment_token: systems.erc20.contract_address,
            metadata: new_metadata,
        );

    // [Assert] Changes applied
    let mut store = StoreTrait::new(world);
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.price, new_price);
    assert_eq!(starterpack.referral_percentage, new_referral);
    assert_eq!(starterpack.reissuable, true);
}

#[test]
#[should_panic(expected: ('Starterpack: not owner', 'ENTRYPOINT_FAILED'))]
fn test_sp_update_unauthorized() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Pack", description: "Test", image_uri: "https://example.com/image.png",
    };
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: false,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Update] Try to update from different address - should fail
    testing::set_contract_address(context.spender);
    let new_metadata = StarterPackMetadata {
        name: "Hacked", description: "Hacked", image_uri: "https://evil.com/image.png",
    };
    systems
        .starterpack
        .update(
            starterpack_id: starterpack_id,
            implementation: systems.starterpack_impl,
            referral_percentage: 50,
            reissuable: true,
            price: 1,
            payment_token: systems.erc20.contract_address,
            metadata: new_metadata,
        );
}

#[test]
fn test_sp_pause_resume() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Pack", description: "Test", image_uri: "https://example.com/image.png",
    };
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: false,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Pause]
    systems.starterpack.pause(starterpack_id);

    // [Assert] Status is paused
    let mut store = StoreTrait::new(world);
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.status, Status::Paused);

    // [Resume]
    systems.starterpack.resume(starterpack_id);

    // [Assert] Status is active
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.status, Status::Active);
}

#[test]
#[should_panic(expected: ('Starterpack: not owner', 'ENTRYPOINT_FAILED'))]
fn test_sp_pause_unauthorized() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Pack", description: "Test", image_uri: "https://example.com/image.png",
    };
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: false,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Pause] Try from unauthorized address - should fail
    testing::set_contract_address(context.spender);
    systems.starterpack.pause(starterpack_id);
}

#[test]
#[should_panic(expected: ('Starterpack: not owner', 'ENTRYPOINT_FAILED'))]
fn test_sp_resume_unauthorized() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Pack", description: "Test", image_uri: "https://example.com/image.png",
    };
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: false,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Pause] As owner
    systems.starterpack.pause(starterpack_id);

    // [Resume] Try from unauthorized address - should fail
    testing::set_contract_address(context.spender);
    systems.starterpack.resume(starterpack_id);
}

