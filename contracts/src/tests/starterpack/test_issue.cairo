// Internal imports

use arcade::systems::starterpack::{
    IAdministrationDispatcherTrait, IStarterpackDispatcherTrait, StarterPackMetadata
};
use arcade::tests::setup::setup::{OWNER, RECEIVER, PLAYER, spawn};
use openzeppelin_token::erc20::interface::IERC20DispatcherTrait;
use starknet::testing;
use starterpack::models::index::{Issuance, Starterpack};
use starterpack::store::{StoreTrait, IssuanceStoreTrait, StarterpackStoreTrait};

// Constants

const PROTOCOL_FEE: u8 = 5; // 5%
const REFERRAL_PERCENTAGE: u8 = 10; // 10%
const PRICE: u256 = 1_000_000_000_000_000_000; // 1 token

// Tests

#[test]
fn test_issue_starterpack() {
    // [Setup]
    let (world, systems, context) = spawn();
    
    // [Initialize] Protocol
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(
            protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER(),
        );
    
    // [Register] Starterpack
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
    
    // [Issue] Starterpack to player
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            referrer: Option::None,
            referrer_group: Option::None,
        );
    
    // [Assert] Issuance is recorded
    let mut store = StoreTrait::new(world);
    let issuance: Issuance = store.get_issuance(starterpack_id, PLAYER());
    assert!(issuance.issued_at > 0);
    
    // [Assert] Total issued count incremented
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.total_issued, 1);
}

#[test]
fn test_issue_with_referrer() {
    // [Setup]
    let (_world, systems, context) = spawn();
    
    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(
            protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER(),
        );
    
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
    
    // [Record] Initial balances
    let referrer_initial = systems.erc20.balance_of(context.holder);
    
    // [Issue] With referrer
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            referrer: Option::Some(context.holder),
            referrer_group: Option::None,
        );
    
    // [Assert] Referrer received fee (10% of PRICE)
    let referrer_fee = PRICE * REFERRAL_PERCENTAGE.into() / 100;
    let referrer_final = systems.erc20.balance_of(context.holder);
    assert_eq!(referrer_final - referrer_initial, referrer_fee);
}

#[test]
#[should_panic(expected: 'Issuance: already issued')]
fn test_issue_not_reissuable() {
    // [Setup]
    let (_world, systems, context) = spawn();
    
    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(
            protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER(),
        );
    
    // [Register] Non-reissuable starterpack
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Pack", description: "Test", image_uri: "https://example.com/image.png",
    };
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: false, // Not reissuable
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );
    
    // [Issue] First time
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost * 2);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            referrer: Option::None,
            referrer_group: Option::None,
        );
    
    // [Issue] Try again - should fail
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            referrer: Option::None,
            referrer_group: Option::None,
        );
}

#[test]
fn test_issue_reissuable() {
    // [Setup]
    let (world, systems, context) = spawn();
    
    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(
            protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER(),
        );
    
    // [Register] Reissuable starterpack
    testing::set_contract_address(context.creator);
    let metadata = StarterPackMetadata {
        name: "Test Pack", description: "Test", image_uri: "https://example.com/image.png",
    };
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true, // Reissuable
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );
    
    // [Issue] First time
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost * 2);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            referrer: Option::None,
            referrer_group: Option::None,
        );
    
    // [Issue] Second time - should succeed
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            referrer: Option::None,
            referrer_group: Option::None,
        );
    
    // [Assert] Total issued is 2
    let mut store = StoreTrait::new(world);
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.total_issued, 2);
}

#[test]
#[should_panic(expected: 'Starterpack: not active')]
fn test_issue_paused() {
    // [Setup]
    let (_world, systems, context) = spawn();
    
    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(
            protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER(),
        );
    
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
    
    // [Pause] Starterpack
    systems.starterpack.pause(starterpack_id);
    
    // [Issue] Try to issue paused starterpack - should fail
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            referrer: Option::None,
            referrer_group: Option::None,
        );
}

