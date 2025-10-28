// External imports

// Internal imports

use arcade::systems::marketplace::IMarketplaceDispatcherTrait;
use arcade::tests::setup::setup::spawn;
use openzeppelin::token::erc1155::interface::IERC1155DispatcherTrait;
use openzeppelin::token::erc20::interface::IERC20DispatcherTrait;
use orderbook::constants;

// Package imports

use orderbook::models::order::OrderAssert;

// Constants

const EXPIRATION: u64 = 1748950141;
const ORDER_ID: u32 = 1;
const TOKEN_ID: u256 = 1;
const QUANTITY: u128 = 5;
const PRICE: u128 = 1_000_000_000_000_000_000;
const CLIENT_FEE: u32 = 200;

// Tests

#[test]
fn test_list_fees() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Sell] Create a sell order on the Marketplace
    starknet::testing::set_contract_address(context.holder);
    contracts.erc1155.set_approval_for_all(contracts.marketplace.contract_address, true);
    contracts
        .marketplace
        .list(
            collection: contracts.erc1155.contract_address,
            token_id: TOKEN_ID,
            quantity: QUANTITY,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
            royalties: true,
        );
    // [Buy] Spender buys the token
    starknet::testing::set_contract_address(context.spender);
    let price = PRICE * QUANTITY;
    let total_price = price + CLIENT_FEE.into() * price / constants::DEFAULT_FEE_DENOMINATOR.into();
    contracts.erc20.approve(contracts.marketplace.contract_address, total_price.into());
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc1155.contract_address,
            token_id: TOKEN_ID,
            asset_id: TOKEN_ID,
            quantity: QUANTITY,
            royalties: true,
            client_fee: CLIENT_FEE,
            client_receiver: context.client_receiver,
        );
    // [Assert] Balances are distributed correctly
    assert_eq!(contracts.erc20.balance_of(context.holder), 4_500_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.creator), 250_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.spender), 4_900_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.receiver), 250_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.client_receiver), 100_000_000_000_000_000);
}

#[test]
fn test_offer_fees() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Buy] Create a buy order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    let price = PRICE * QUANTITY;
    let total_price = price + CLIENT_FEE.into() * price / constants::DEFAULT_FEE_DENOMINATOR.into();
    contracts.erc20.approve(contracts.marketplace.contract_address, total_price.into());
    contracts
        .marketplace
        .offer(
            collection: contracts.erc1155.contract_address,
            token_id: TOKEN_ID,
            quantity: QUANTITY,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
        );
    // [Buy] Spender buys the token;
    starknet::testing::set_contract_address(context.holder);
    contracts.erc1155.set_approval_for_all(contracts.marketplace.contract_address, true);
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc1155.contract_address,
            token_id: TOKEN_ID,
            asset_id: TOKEN_ID,
            quantity: QUANTITY,
            royalties: true,
            client_fee: CLIENT_FEE,
            client_receiver: context.client_receiver,
        );
    // [Assert] Balances are distributed correctly
    assert_eq!(contracts.erc20.balance_of(context.holder), 4_500_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.creator), 250_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.spender), 4_900_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.receiver), 250_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.client_receiver), 100_000_000_000_000_000);
}

#[test]
fn test_intent_fees() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Buy] Create a buy order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    let price = PRICE * QUANTITY;
    let total_price = price + CLIENT_FEE.into() * price / constants::DEFAULT_FEE_DENOMINATOR.into();
    contracts.erc20.approve(contracts.marketplace.contract_address, total_price.into());
    contracts
        .marketplace
        .intent(
            collection: contracts.erc1155.contract_address,
            quantity: QUANTITY,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
        );
    // [Buy] Spender buys the token;
    starknet::testing::set_contract_address(context.holder);
    contracts.erc1155.set_approval_for_all(contracts.marketplace.contract_address, true);
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc1155.contract_address,
            token_id: 0,
            asset_id: TOKEN_ID,
            quantity: QUANTITY,
            royalties: true,
            client_fee: CLIENT_FEE,
            client_receiver: context.client_receiver,
        );
    // [Assert] Balances are distributed correctly
    assert_eq!(contracts.erc20.balance_of(context.holder), 4_500_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.creator), 250_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.spender), 4_900_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.receiver), 250_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.client_receiver), 100_000_000_000_000_000);
}

