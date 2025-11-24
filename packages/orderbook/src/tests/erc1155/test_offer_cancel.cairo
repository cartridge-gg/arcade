// External imports

// Internal imports

use openzeppelin::token::erc1155::interface::IERC1155DispatcherTrait;
use openzeppelin::token::erc20::interface::IERC20DispatcherTrait;
use crate::models::order::OrderAssert;

// Package imports

use crate::store::StoreTrait;
use crate::tests::mocks::marketplace::IMarketplaceDispatcherTrait;
use crate::tests::setup::setup::spawn;
use crate::types::status::Status;

// Constants

const EXPIRATION: u64 = 1748950141;
const ORDER_ID: u32 = 1;
const TOKEN_ID: u256 = 1;
const QUANTITY: u128 = 5;
const PRICE: u128 = 1_000_000_000_000_000_000;

// Tests

#[test]
fn test_offer_cancel() {
    // [Setup] World
    let (world, contracts, context) = spawn();
    // [Sell] Create a sell order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, QUANTITY.into() * PRICE.into());
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
    contracts
        .marketplace
        .cancel(
            order_id: ORDER_ID, collection: contracts.erc1155.contract_address, token_id: TOKEN_ID,
        );
    // [Assert] Order is canceled
    let store = StoreTrait::new(world);
    let collection: felt252 = contracts.erc1155.contract_address.into();
    let order = store.order(ORDER_ID, collection, TOKEN_ID);
    // [Assert] Order values
    assert_eq!(order.status, Status::Canceled.into());
}

#[test]
#[should_panic(expected: ('Order: invalid status', 'ENTRYPOINT_FAILED'))]
fn test_offer_cancel_execute_revert_cannot_be_executed() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Sell] Create a sell order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, QUANTITY.into() * PRICE.into());
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
    contracts
        .marketplace
        .cancel(
            order_id: ORDER_ID, collection: contracts.erc1155.contract_address, token_id: TOKEN_ID,
        );
    // [Buy] Spender buys the token
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
            client_fee: 0,
            client_receiver: context.receiver,
        );
}

#[test]
#[should_panic(expected: ('Order: caller not allowed', 'ENTRYPOINT_FAILED'))]
fn test_offer_cancel_revert_not_owner() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Sell] Create a sell order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, QUANTITY.into() * PRICE.into());
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
    // [Action] Cancel order
    starknet::testing::set_contract_address(context.holder);
    contracts
        .marketplace
        .cancel(
            order_id: ORDER_ID, collection: contracts.erc1155.contract_address, token_id: TOKEN_ID,
        );
}
