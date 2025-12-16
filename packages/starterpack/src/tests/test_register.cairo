// Internal imports

use starknet::testing;
use crate::models::index::Starterpack;
use crate::store::{StarterpackStoreTrait, StoreTrait};
use crate::tests::mocks::registry::IRegistryDispatcherTrait;
use crate::tests::setup::setup::{METADATA, OWNER, spawn};
use crate::types::status::Status;

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
    testing::set_block_timestamp(1);

    // [Register] Starterpack
    testing::set_contract_address(context.creator);
    let metadata = METADATA();

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
    testing::set_block_timestamp(1);

    // [Register] With invalid referral percentage (>50%)
    testing::set_contract_address(context.creator);
    let metadata = METADATA();

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
    testing::set_block_timestamp(1);

    // [Register] First starterpack
    testing::set_contract_address(context.creator);
    let metadata = METADATA();
    let id1 = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata.clone(),
        );

    // [Register] Second starterpack
    let id2 = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: 20,
            reissuable: false,
            price: PRICE * 2,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
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

#[test]
#[should_panic(expected: ('Starterpack: not found', 'ENTRYPOINT_FAILED'))]
fn test_sp_not_found_metadata() {
    // [Setup]
    let (_world, systems, _context) = spawn();

    // [Initialize] Protocol
    testing::set_contract_address(OWNER());

    // [Try] Access metadata of non-existent starterpack - should fail
    let _non_existent_id = 99999_u32;
    systems.starterpack.metadata(_non_existent_id);
}

#[test]
#[should_panic(expected: ('Starterpack: not found', 'ENTRYPOINT_FAILED'))]
fn test_sp_not_found_quote() {
    // [Setup]
    let (_world, systems, _context) = spawn();

    // [Initialize] Protocol
    testing::set_contract_address(OWNER());

    // [Try] Get quote for non-existent starterpack - should fail
    let _non_existent_id = 99999_u32;
    systems.starterpack.quote(_non_existent_id, 1, false);
}

#[test]
#[should_panic(expected: ('Starterpack: not found', 'ENTRYPOINT_FAILED'))]
fn test_sp_not_found_update() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize] Protocol
    testing::set_contract_address(OWNER());

    // [Try] Update non-existent starterpack - should fail
    testing::set_contract_address(context.creator);
    let _non_existent_id = 99999_u32;
    systems
        .starterpack
        .update(
            starterpack_id: _non_existent_id,
            implementation: systems.starterpack_impl,
            referral_percentage: 10,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
        );
}

