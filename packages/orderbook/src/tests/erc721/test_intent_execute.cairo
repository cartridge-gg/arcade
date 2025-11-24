// External imports

// Internal imports

use openzeppelin::token::erc20::interface::IERC20DispatcherTrait;
use openzeppelin::token::erc721::interface::IERC721DispatcherTrait;
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
const PRICE: u128 = 1_000_000_000_000_000_000;

// Tests

#[test]
fn test_intent_execute() {
    // [Setup] World
    let (world, contracts, context) = spawn();
    // [Buy] Create a buy order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, PRICE.into());
    contracts
        .marketplace
        .intent(
            collection: contracts.erc721.contract_address,
            quantity: 0,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
        );
    // [Assert] Order is created
    let store = StoreTrait::new(world);
    let collection: felt252 = contracts.erc721.contract_address.into();
    let order = store.order(ORDER_ID, collection, 0);
    order.assert_does_exist();
    // [Assert] Order values
    assert_eq!(order.category, Category::BuyAny.into());
    assert_eq!(order.status, Status::Placed.into());
    assert_eq!(order.expiration, EXPIRATION);
    assert_eq!(order.quantity, 0);
    assert_eq!(order.price, PRICE);
    assert_eq!(order.currency, contracts.erc20.contract_address.into());
    assert_eq!(order.owner, context.spender.into());
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
            client_fee: 0,
            client_receiver: context.receiver,
        );
    // [Assert] Order is executed
    let order = store.order(ORDER_ID, collection, 0);
    assert_eq!(order.status, Status::Executed.into());
}

#[test]
#[should_panic(expected: ('Sale: invalid value', 'ENTRYPOINT_FAILED'))]
fn test_intent_execute_revert_invalid_value() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Buy] Create a buy order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, PRICE.into());
    contracts
        .marketplace
        .intent(
            collection: contracts.erc721.contract_address,
            quantity: 1,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
        );
}

#[test]
#[should_panic(expected: ('Order: does not exist', 'ENTRYPOINT_FAILED'))]
fn test_intent_revert_order_not_found() {
    // [Setup] World
    let (_world, contracts, context) = spawn();
    // [Buy] Create a buy order on the Marketplace
    starknet::testing::set_contract_address(context.spender);
    contracts.erc20.approve(contracts.marketplace.contract_address, PRICE.into());
    contracts
        .marketplace
        .intent(
            collection: contracts.erc721.contract_address,
            quantity: 0,
            price: PRICE,
            currency: contracts.erc20.contract_address,
            expiration: EXPIRATION,
        );
    // [Buy] Spender buys the asset;
    starknet::testing::set_contract_address(context.holder);
    contracts.erc721.set_approval_for_all(contracts.marketplace.contract_address, true);
    contracts
        .marketplace
        .execute(
            order_id: ORDER_ID,
            collection: contracts.erc1155.contract_address,
            token_id: 0,
            asset_id: TOKEN_ID,
            quantity: 0,
            royalties: true,
            client_fee: 0,
            client_receiver: context.receiver,
        );
}
