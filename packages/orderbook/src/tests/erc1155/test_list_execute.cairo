// External imports

// Internal imports

use openzeppelin::token::erc1155::interface::IERC1155DispatcherTrait;
use openzeppelin::token::erc20::interface::IERC20DispatcherTrait;
use crate::models::order::OrderAssert;

// Package imports

use crate::store::StoreTrait;
use crate::tests::mocks::marketplace::IMarketplaceDispatcherTrait;
use crate::tests::setup::setup::spawn;
use crate::types::category::Category;
use crate::types::status::Status;

// Constants

const EXPIRATION: u64 = 1748950141;
const ORDER_ID: u32 = 1;
const TOKEN_ID: u256 = 1;
const QUANTITY: u128 = 5;
const PRICE: u128 = 1_000_000_000_000_000_000;

// Tests

#[test]
fn test_list_execute() {
    // [Setup] World
    let (world, contracts, context) = spawn();
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
    // [Assert] Order is created
    let store = StoreTrait::new(world);
    let collection: felt252 = contracts.erc1155.contract_address.into();
    let order = store.order(ORDER_ID, collection, TOKEN_ID);
    order.assert_does_exist();
    // [Assert] Order values
    assert_eq!(order.category, Category::Sell.into());
    assert_eq!(order.status, Status::Placed.into());
    assert_eq!(order.expiration, EXPIRATION);
    assert_eq!(order.quantity, QUANTITY);
    assert_eq!(order.price, PRICE);
    assert_eq!(order.currency, contracts.erc20.contract_address.into());
    assert_eq!(order.owner, context.holder.into());
    // [Buy] Spender buys half of the assets
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, QUANTITY.into() * PRICE.into());
    contracts
        .marketplace
        .execute(
            order_id: order.id,
            collection: contracts.erc1155.contract_address,
            token_id: order.token_id,
            asset_id: order.token_id,
            quantity: order.quantity / 2,
            royalties: true,
            client_fee: 0,
            client_receiver: context.receiver,
        );
    // [Assert] Order is executed
    let order = store.order(ORDER_ID, collection, TOKEN_ID);
    assert_eq!(order.status, Status::Placed.into());
    // [Buy] Spender buys the remaining value
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, QUANTITY.into() * PRICE.into());
    contracts
        .marketplace
        .execute(
            order_id: order.id,
            collection: contracts.erc1155.contract_address,
            token_id: order.token_id,
            asset_id: order.token_id,
            quantity: order.quantity,
            royalties: true,
            client_fee: 0,
            client_receiver: context.receiver,
        );
    // [Assert] Order is executed
    let order = store.order(ORDER_ID, collection, TOKEN_ID);
    assert_eq!(order.status, Status::Executed.into());
}

#[test]
#[should_panic(expected: ('Sale: invalid value', 'ENTRYPOINT_FAILED'))]
fn test_list_execute_revert_invalid_value() {
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
            quantity: 0,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
            royalties: true,
        );
}

#[test]
#[should_panic(expected: ('Order: invalid quantity', 'ENTRYPOINT_FAILED'))]
fn test_list_revert_cannot_execute() {
    // [Setup] World
    let (world, contracts, context) = spawn();
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
    // [Buy] Spender buys half of the assets
    let store = StoreTrait::new(world);
    let collection: felt252 = contracts.erc1155.contract_address.into();
    let order = store.order(ORDER_ID, collection, TOKEN_ID);
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, QUANTITY.into() * PRICE.into());
    contracts
        .marketplace
        .execute(
            order_id: order.id,
            collection: contracts.erc1155.contract_address,
            token_id: order.token_id,
            asset_id: order.token_id,
            quantity: order.quantity * 2,
            royalties: true,
            client_fee: 0,
            client_receiver: context.receiver,
        );
}

#[test]
#[should_panic(expected: ('Sale: invalid value', 'ENTRYPOINT_FAILED'))]
fn test_list_revert_invalid_value() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Sell] Create a sell order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
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
}

#[test]
#[should_panic(expected: ('Sale: not approved', 'ENTRYPOINT_FAILED'))]
fn test_list_revert_not_approved() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Sell] Create a sell order on the Marketplace
    starknet::testing::set_contract_address(context.holder);
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
}

#[test]
#[should_panic(expected: ('Sale: not allowed', 'ENTRYPOINT_FAILED'))]
fn test_list_revert_not_allowed() {
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
    contracts.erc20.approve(contracts.marketplace.contract_address, (PRICE - 1).into());
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
#[should_panic(expected: ('Sale: invalid balance', 'ENTRYPOINT_FAILED'))]
fn test_list_revert_not_invalid_balance() {
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
            price: PRICE * PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
            royalties: true,
        );
    // [Buy] Spender buys the token
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, (PRICE * PRICE).into());
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
#[should_panic(expected: ('Sale: not approved', 'ENTRYPOINT_FAILED'))]
fn test_list_revert_invalid_sell() {
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
    // [Action] Revoke approval
    contracts.erc1155.set_approval_for_all(contracts.marketplace.contract_address, false);
    // [Buy] Spender buys the token
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, QUANTITY.into() * PRICE.into());
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

