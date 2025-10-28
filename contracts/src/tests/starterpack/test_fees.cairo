// Internal imports

use arcade::systems::starterpack::IStarterpackRegistryDispatcherTrait;
use arcade::tests::setup::setup::{OWNER, PLAYER, spawn};
use openzeppelin::token::erc20::interface::IERC20DispatcherTrait;
use starknet::testing;
use starterpack::constants::FEE_DENOMINATOR;

// Constants

const PROTOCOL_FEE: u8 = 5; // 5%
const REFERRAL_PERCENTAGE: u8 = 10; // 10%
const PRICE: u256 = 1_000_000_000_000_000_000; // 1 token (1e18)
const SPENDER_INITIAL_BALANCE: u256 = 10_000_000_000_000_000_000; // 10 tokens

// Tests

#[test]
fn test_sp_fees_distribution_no_referrer() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    testing::set_block_timestamp(1);

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
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
    let spender_initial = systems.erc20.balance_of(context.spender);
    let creator_initial = systems.erc20.balance_of(context.creator);
    let receiver_initial = systems.erc20.balance_of(context.receiver);

    // [Issue] Without referrer
    testing::set_contract_address(context.spender);
    let protocol_fee_amount = PRICE * PROTOCOL_FEE.into() / FEE_DENOMINATOR.into();
    let total_cost = PRICE + protocol_fee_amount;
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
        );

    // [Assert] Fee distribution
    // Spender paid: base price (1 token) + protocol fee (0.05 token) = 1.05 tokens
    assert_eq!(
        systems.erc20.balance_of(context.spender), spender_initial - total_cost, "Spender balance",
    );

    // Creator received: full base price (1 token)
    assert_eq!(
        systems.erc20.balance_of(context.creator), creator_initial + PRICE, "Creator balance",
    );

    // Protocol receiver got: 0.05 tokens
    assert_eq!(
        systems.erc20.balance_of(context.receiver),
        receiver_initial + protocol_fee_amount,
        "Protocol receiver balance",
    );
}

#[test]
fn test_sp_fees_distribution_with_referrer() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    testing::set_block_timestamp(1);

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
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
    let spender_initial = systems.erc20.balance_of(context.spender);
    let creator_initial = systems.erc20.balance_of(context.creator);
    let receiver_initial = systems.erc20.balance_of(context.receiver);
    let referrer_initial = systems.erc20.balance_of(context.holder);

    // [Issue] With referrer
    testing::set_contract_address(context.spender);
    let protocol_fee_amount = PRICE * PROTOCOL_FEE.into() / FEE_DENOMINATOR.into();
    let referral_fee_amount = PRICE * REFERRAL_PERCENTAGE.into() / FEE_DENOMINATOR.into();
    let total_cost = PRICE + protocol_fee_amount;
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::Some(context.holder),
            referrer_group: Option::None,
        );

    // [Assert] Fee distribution
    // Spender paid: base price (1 token) + protocol fee (0.05 token) = 1.05 tokens
    assert_eq!(
        systems.erc20.balance_of(context.spender), spender_initial - total_cost, "Spender balance",
    );

    // Referrer received: 10% of base price = 0.1 tokens
    assert_eq!(
        systems.erc20.balance_of(context.holder),
        referrer_initial + referral_fee_amount,
        "Referrer balance",
    );

    // Creator received: base price minus referral fee = 1 - 0.1 = 0.9 tokens
    assert_eq!(
        systems.erc20.balance_of(context.creator),
        creator_initial + (PRICE - referral_fee_amount),
        "Creator balance",
    );

    // Protocol receiver got: 0.05 tokens
    assert_eq!(
        systems.erc20.balance_of(context.receiver),
        receiver_initial + protocol_fee_amount,
        "Protocol receiver balance",
    );
}

#[test]
fn test_sp_quote_calculation() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    testing::set_block_timestamp(1);

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
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

    // [Quote] Without referrer
    let quote_no_ref = systems.starterpack.quote(starterpack_id, 1, false);
    assert_eq!(quote_no_ref.base_price, PRICE);
    assert_eq!(quote_no_ref.referral_fee, 0);
    assert_eq!(quote_no_ref.protocol_fee, PRICE * PROTOCOL_FEE.into() / FEE_DENOMINATOR.into());
    assert_eq!(quote_no_ref.total_cost, PRICE + quote_no_ref.protocol_fee);
    assert_eq!(quote_no_ref.payment_token, systems.erc20.contract_address);

    // [Quote] With referrer
    let quote_with_ref = systems.starterpack.quote(starterpack_id, 1, true);
    assert_eq!(quote_with_ref.base_price, PRICE);
    assert_eq!(
        quote_with_ref.referral_fee, PRICE * REFERRAL_PERCENTAGE.into() / FEE_DENOMINATOR.into(),
    );
    assert_eq!(quote_with_ref.protocol_fee, PRICE * PROTOCOL_FEE.into() / FEE_DENOMINATOR.into());
    assert_eq!(quote_with_ref.total_cost, PRICE + quote_with_ref.protocol_fee);
    assert_eq!(quote_with_ref.payment_token, systems.erc20.contract_address);
}

#[test]
fn test_sp_free() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    testing::set_block_timestamp(1);

    // [Register] Free starterpack (price = 0)
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Free Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: 0, // Free!
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Record] Initial balance
    let spender_initial = systems.erc20.balance_of(context.spender);

    // [Issue] Free starterpack
    testing::set_contract_address(context.spender);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
        );

    // [Assert] No payment made
    assert_eq!(systems.erc20.balance_of(context.spender), spender_initial, "No payment for free");
}
