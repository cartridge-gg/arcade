// External imports

// Internal imports

use arcade::systems::marketplace::IMarketplaceDispatcherTrait;
use arcade::tests::setup::setup::spawn;
use openzeppelin_token::erc20::interface::IERC20DispatcherTrait;
use openzeppelin_token::erc721::interface::IERC721DispatcherTrait;
use orderbook::models::order::OrderAssert;

// Package imports

use orderbook::store::StoreTrait;
use orderbook::types::status::Status;

// Constants

const EXPIRATION: u64 = 1748950141;
const ORDER_ID: u32 = 1;
const TOKEN_ID: u256 = 1;
const PRICE: u128 = 1_000_000_000_000_000_000;

// Tests

#[test]
fn test_list_remove() {
    // [Setup] World
    let (world, contracts, context) = spawn();
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
    // [Action] Revoke approval
    contracts.erc721.set_approval_for_all(contracts.marketplace.contract_address, false);
    // [Remove] Remove order
    starknet::testing::set_contract_address(context.spender);
    contracts
        .marketplace
        .remove(
            order_id: ORDER_ID, collection: contracts.erc721.contract_address, token_id: TOKEN_ID,
        );
    // [Assert] Order is removed
    let store = StoreTrait::new(world);
    let collection: felt252 = contracts.erc721.contract_address.into();
    let order = store.order(ORDER_ID, collection, TOKEN_ID);
    // [Assert] Order values
    assert_eq!(order.status, Status::Canceled.into());
}

#[test]
#[should_panic(expected: ('Sale: not invalid', 'ENTRYPOINT_FAILED'))]
fn test_list_remove_revert_not_invalid() {
    // [Setup] World
    let (world, contracts, context) = spawn();
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
    contracts
        .marketplace
        .remove(
            order_id: ORDER_ID, collection: contracts.erc721.contract_address, token_id: TOKEN_ID,
        );
    // [Assert] Order is removed
    let store = StoreTrait::new(world);
    let collection: felt252 = contracts.erc721.contract_address.into();
    let order = store.order(ORDER_ID, collection, TOKEN_ID);
    // [Assert] Order values
    assert_eq!(order.status, Status::Canceled.into());
}

#[test]
#[should_panic(expected: ('Order: invalid status', 'ENTRYPOINT_FAILED'))]
fn test_list_remove_execute_revert_cannot_be_executed() {
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
    // [Action] Revoke approval
    contracts.erc721.set_approval_for_all(contracts.marketplace.contract_address, false);
    // [Remove] Remove order
    starknet::testing::set_contract_address(context.spender);
    contracts
        .marketplace
        .remove(
            order_id: ORDER_ID, collection: contracts.erc721.contract_address, token_id: TOKEN_ID,
        );
    // [Action] Set approval
    contracts.erc721.set_approval_for_all(contracts.marketplace.contract_address, true);
    // [Buy] Spender buys the token
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, PRICE.into());
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc721.contract_address,
            token_id: TOKEN_ID,
            asset_id: TOKEN_ID,
            quantity: 0,
            royalties: true,
            client_fee: 0,
            client_receiver: context.receiver,
        );
}
