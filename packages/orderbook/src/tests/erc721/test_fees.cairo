// External imports

// Internal imports

use openzeppelin::token::erc20::interface::IERC20DispatcherTrait;
use openzeppelin::token::erc721::interface::IERC721DispatcherTrait;
use crate::constants;

// Package imports

use crate::models::order::OrderAssert;
use crate::tests::mocks::marketplace::IMarketplaceDispatcherTrait;
use crate::tests::setup::setup::spawn;

// Constants

const EXPIRATION: u64 = 1748950141;
const ORDER_ID: u32 = 1;
const TOKEN_ID: u256 = 1;
const PRICE: u128 = 1_000_000_000_000_000_000;
const CLIENT_FEE: u32 = 200;

// Tests

#[test]
fn test_list_fees() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Sell] Create a sell order on the Marketplace
    starknet::testing::set_contract_address(context.holder);
    contracts.erc721.set_approval_for_all(contracts.marketplace.contract_address, true);
    contracts
        .marketplace
        .list(
            collection: contracts.erc721.contract_address,
            token_id: TOKEN_ID,
            quantity: 0,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
            royalties: true,
        );
    // [Buy] Spender buys the token
    starknet::testing::set_contract_address(context.spender);
    let total_price = PRICE + CLIENT_FEE.into() * PRICE / constants::DEFAULT_FEE_DENOMINATOR.into();
    contracts.erc20.approve(contracts.marketplace.contract_address, total_price.into());
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc721.contract_address,
            token_id: TOKEN_ID,
            asset_id: TOKEN_ID,
            quantity: 0,
            royalties: true,
            client_fee: CLIENT_FEE,
            client_receiver: context.client_receiver,
        );
    // [Assert] Balances are distributed correctly
    assert_eq!(contracts.erc20.balance_of(context.holder), 900_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.creator), 50_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.spender), 8_980_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.receiver), 50_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.client_receiver), 20_000_000_000_000_000);
}

#[test]
fn test_offer_fees() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Buy] Create a buy order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    let total_price = PRICE + CLIENT_FEE.into() * PRICE / constants::DEFAULT_FEE_DENOMINATOR.into();
    contracts.erc20.approve(contracts.marketplace.contract_address, total_price.into());
    contracts
        .marketplace
        .offer(
            collection: contracts.erc721.contract_address,
            token_id: TOKEN_ID,
            quantity: 0,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
        );
    // [Buy] Spender buys the token;
    starknet::testing::set_contract_address(context.holder);
    contracts.erc721.set_approval_for_all(contracts.marketplace.contract_address, true);
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc721.contract_address,
            token_id: TOKEN_ID,
            asset_id: TOKEN_ID,
            quantity: 0,
            royalties: true,
            client_fee: CLIENT_FEE,
            client_receiver: context.client_receiver,
        );
    // [Assert] Balances are distributed correctly
    assert_eq!(contracts.erc20.balance_of(context.holder), 900_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.creator), 50_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.spender), 8_980_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.receiver), 50_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.client_receiver), 20_000_000_000_000_000);
}

#[test]
fn test_intent_fees() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Buy] Create a buy order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    let total_price = PRICE + CLIENT_FEE.into() * PRICE / constants::DEFAULT_FEE_DENOMINATOR.into();
    contracts.erc20.approve(contracts.marketplace.contract_address, total_price.into());
    contracts
        .marketplace
        .intent(
            collection: contracts.erc721.contract_address,
            quantity: 0,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
        );
    // [Buy] Spender buys the token;
    starknet::testing::set_contract_address(context.holder);
    contracts.erc721.set_approval_for_all(contracts.marketplace.contract_address, true);
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc721.contract_address,
            token_id: 0,
            asset_id: TOKEN_ID,
            quantity: 0,
            royalties: true,
            client_fee: CLIENT_FEE,
            client_receiver: context.client_receiver,
        );
    // [Assert] Balances are distributed correctly
    assert_eq!(contracts.erc20.balance_of(context.holder), 900_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.creator), 50_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.spender), 8_980_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.receiver), 50_000_000_000_000_000);
    assert_eq!(contracts.erc20.balance_of(context.client_receiver), 20_000_000_000_000_000);
}
