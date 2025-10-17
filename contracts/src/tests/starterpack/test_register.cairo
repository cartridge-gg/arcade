// Internal imports

use arcade::systems::starterpack::{IStarterpackRegistryDispatcherTrait, StarterPackMetadata};
use arcade::tests::setup::setup::{OWNER, spawn};
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
fn test_sp_register() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize] Protocol
    testing::set_contract_address(OWNER());

    // [Register] Starterpack
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Starterpack",
        description: "A test starterpack for new players",
        image_uri: "https://example.com/image.png",
    };

    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Assert] Starterpack is created
    let mut store = StoreTrait::new(world);
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.starterpack_id, starterpack_id);
    assert_eq!(starterpack.owner, context.creator);
    assert_eq!(starterpack.implementation, systems.starterpack_impl);
    assert_eq!(starterpack.referral_percentage, REFERRAL_PERCENTAGE);
    assert_eq!(starterpack.reissuable, true);
    assert_eq!(starterpack.price, PRICE);
    assert_eq!(starterpack.payment_token, systems.erc20.contract_address);
    assert_eq!(starterpack.status, Status::Active);
    assert_eq!(starterpack.total_issued, 0);
}

#[test]
#[should_panic(expected: ('Starterpack: referral too high', 'ENTRYPOINT_FAILED'))]
fn test_sp_register_invalid_referral_percentage() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize] Protocol
    testing::set_contract_address(OWNER());

    // [Register] With invalid referral percentage (>50%)
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Starterpack", description: "Test", image_uri: "https://example.com/image.png",
    };

    systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: 51, // Too high!
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );
}

#[test]
fn test_sp_register_multiple_starterpacks() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize] Protocol
    testing::set_contract_address(OWNER());

    // [Register] First starterpack
    testing::set_contract_address(context.creator);
    let metadata1 = StarterPackMetadata {
        name: "Starterpack 1", description: "First", image_uri: "https://example.com/1.png",
    };
    let id1 = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata1,
        );

    // [Register] Second starterpack
    let metadata2 = StarterPackMetadata {
        name: "Starterpack 2", description: "Second", image_uri: "https://example.com/2.png",
    };
    let id2 = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: 20,
            reissuable: false,
            price: PRICE * 2,
            payment_token: systems.erc20.contract_address,
            metadata: metadata2,
        );

    // [Assert] Both starterpacks exist and are different
    assert_ne!(id1, id2);
    let mut store = StoreTrait::new(world);
    let sp1: Starterpack = store.get_starterpack(id1);
    let sp2: Starterpack = store.get_starterpack(id2);
    assert_eq!(sp1.referral_percentage, REFERRAL_PERCENTAGE);
    assert_eq!(sp2.referral_percentage, 20);
    assert_eq!(sp1.reissuable, true);
    assert_eq!(sp2.reissuable, false);
}

