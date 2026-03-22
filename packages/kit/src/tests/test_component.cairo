use starknet::testing::{set_block_timestamp, set_contract_address};
use crate::models::kit::KitAssert;
use crate::store::{IssuanceStoreTrait, KitStoreTrait, StoreTrait};
use crate::tests::contract::ContractTraitDispatcherTrait;
use crate::tests::setup::setup::{CREATOR, METADATA, PAYMENT_TOKEN, PLAYER, Systems, spawn};

const VOUCHER_KEY: felt252 = 'VOUCHER_KEY';
use starknet::ContractAddress;

fn ZERO() -> ContractAddress {
    0.try_into().unwrap()
}

fn register_free_kit(systems: Systems, allower: ContractAddress) -> u32 {
    set_contract_address(CREATOR());
    systems
        .contract
        .register(
            referral_percentage: 0,
            reissuable: false,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: allower,
        )
}

#[test]
fn test_kit_register() {
    let (world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 10,
            reissuable: false,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    let store = StoreTrait::new(world);
    let kit = store.get_kit(kit_id);
    kit.assert_does_exist();
    assert_eq!(kit.payment_receiver, CREATOR());
}

#[test]
fn test_kit_register_multiple() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);

    let kit_1 = register_free_kit(systems, ZERO());
    let kit_2 = register_free_kit(systems, ZERO());

    assert_ne!(kit_1, kit_2);
}

#[test]
#[should_panic(expected: ('Kit: referral too high', 'ENTRYPOINT_FAILED'))]
fn test_kit_register_invalid_referral() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    systems
        .contract
        .register(
            referral_percentage: 51,
            reissuable: false,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );
}

#[test]
#[should_panic(expected: ('Kit: not found', 'ENTRYPOINT_FAILED'))]
fn test_kit_not_found_quote() {
    let (_world, systems) = spawn();
    let _ = systems.contract.quote(99999, 1, false, 0);
}

#[test]
#[should_panic(expected: ('Kit: not found', 'ENTRYPOINT_FAILED'))]
fn test_kit_not_found_update() {
    let (_world, systems) = spawn();

    systems
        .contract
        .update(
            kit_id: 99999,
            referral_percentage: 10,
            reissuable: true,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: PLAYER(),
            allower: CREATOR(),
        );
}

#[test]
fn test_kit_update() {
    let (world, systems) = spawn();
    set_block_timestamp(1);

    let kit_id = register_free_kit(systems, ZERO());

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .contract
        .update(
            kit_id: kit_id,
            referral_percentage: 15,
            reissuable: true,
            price: 1234,
            payment_token: PLAYER(),
            payment_receiver: PLAYER(),
            allower: CREATOR(),
        );

    let store = StoreTrait::new(world);
    let kit = store.get_kit(kit_id);
    assert_eq!(kit.referral_percentage, 15);
    assert_eq!(kit.reissuable, true);
    assert_eq!(kit.price, 1234);
    assert_eq!(kit.payment_token, PLAYER());
    assert_eq!(kit.payment_receiver, PLAYER());
    assert_eq!(kit.allower, CREATOR());
}

#[test]
fn test_kit_quote() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 10,
            reissuable: false,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    let quote = systems.contract.quote(kit_id, 1, false, 0);
    let expected_base: u256 = 1000;
    let expected_referral: u256 = 0;
    assert_eq!(quote.base_price, expected_base);
    assert_eq!(quote.referral_fee, expected_referral);
}

#[test]
fn test_kit_quote_with_referrer() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 10,
            reissuable: false,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    let quote = systems.contract.quote(kit_id, 3, true, 0);
    let expected_base: u256 = 3000;
    let expected_referral: u256 = 300;
    assert_eq!(quote.base_price, expected_base);
    assert_eq!(quote.referral_fee, expected_referral);
}

#[test]
fn test_kit_issue() {
    let (world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, ZERO());

    set_block_timestamp(2);
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
        );

    let store = StoreTrait::new(world);
    let issuance = store.get_issuance(kit_id, PLAYER());
    assert_gt!(issuance.issued_at, 0);
}

#[test]
#[should_panic(expected: ('KitIssuance: already issued', 'ENTRYPOINT_FAILED'))]
fn test_kit_issue_not_reissuable() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, ZERO());

    set_block_timestamp(2);
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
        );

    set_block_timestamp(3);
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
        );
}

#[test]
fn test_kit_issue_reissuable() {
    let (world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 0,
            reissuable: true,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    set_block_timestamp(2);
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
        );

    set_block_timestamp(3);
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
        );

    let store = StoreTrait::new(world);
    let kit = store.get_kit(kit_id);
    assert_eq!(kit.total_issued, 2);
}

#[test]
#[should_panic(expected: ('Kit: quantity > 1', 'ENTRYPOINT_FAILED'))]
fn test_kit_issue_quantity_exceeds_limit() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, ZERO());

    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 3,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
        );
}

#[test]
fn test_kit_conditional_allow_and_issue() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, CREATOR());

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);
}

// Tests - Quote with fees

#[test]
fn test_kit_quote_no_fees() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 0,
            reissuable: false,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    // [Quote] No referrer, no client
    let quote = systems.contract.quote(kit_id, 1, false, 0);
    assert_eq!(quote.base_price, 1000);
    assert_eq!(quote.referral_fee, 0);
    assert_eq!(quote.client_fee, 0);
    // protocol_fee = 5% of 1000 = 50
    assert_eq!(quote.protocol_fee, 50);
    // total_cost = base + protocol + client = 1000 + 50 + 0 = 1050
    assert_eq!(quote.total_cost, 1050);
}

#[test]
fn test_kit_quote_referral_fee() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 10,
            reissuable: false,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    // [Quote] With referrer — referral fee comes from base_price (seller's share)
    let quote = systems.contract.quote(kit_id, 1, true, 0);
    assert_eq!(quote.base_price, 1000);
    // referral_fee = 10% of 1000 = 100
    assert_eq!(quote.referral_fee, 100);
    assert_eq!(quote.client_fee, 0);
    assert_eq!(quote.protocol_fee, 50);
    // total_cost = base + protocol + client = 1000 + 50 + 0 = 1050 (referral doesn't inflate)
    assert_eq!(quote.total_cost, 1050);
}

#[test]
fn test_kit_quote_client_fee() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 0,
            reissuable: false,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    // [Quote] With client 5% — client fee inflates the price
    let quote = systems.contract.quote(kit_id, 1, false, 5);
    assert_eq!(quote.base_price, 1000);
    assert_eq!(quote.referral_fee, 0);
    // client_fee = 5% of 1000 = 50
    assert_eq!(quote.client_fee, 50);
    assert_eq!(quote.protocol_fee, 50);
    // total_cost = base + protocol + client = 1000 + 50 + 50 = 1100
    assert_eq!(quote.total_cost, 1100);
}

#[test]
fn test_kit_quote_all_fees() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 10,
            reissuable: false,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    // [Quote] All fees: referrer 10%, client 5%, protocol 5%
    let quote = systems.contract.quote(kit_id, 1, true, 5);
    assert_eq!(quote.base_price, 1000);
    // referral_fee = 10% of 1000 = 100 (from seller's share)
    assert_eq!(quote.referral_fee, 100);
    // client_fee = 5% of 1000 = 50 (inflates price)
    assert_eq!(quote.client_fee, 50);
    // protocol_fee = 5% of 1000 = 50 (inflates price)
    assert_eq!(quote.protocol_fee, 50);
    // total_cost = 1000 + 50 + 50 = 1100 (referral doesn't inflate)
    assert_eq!(quote.total_cost, 1100);
    // payment_receiver gets = base_price - referral_fee = 1000 - 100 = 900
}

#[test]
fn test_kit_quote_all_fees_with_quantity() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 10,
            reissuable: true,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    // [Quote] Quantity 5 with all fees
    let quote = systems.contract.quote(kit_id, 5, true, 5);
    assert_eq!(quote.base_price, 5000);
    assert_eq!(quote.referral_fee, 500);
    assert_eq!(quote.client_fee, 250);
    assert_eq!(quote.protocol_fee, 250);
    assert_eq!(quote.total_cost, 5500);
}

#[test]
fn test_kit_quote_no_referrer_means_zero_referral_fee() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    // Kit has 10% referral configured but no referrer in quote
    let kit_id = systems
        .contract
        .register(
            referral_percentage: 10,
            reissuable: false,
            price: 1000,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: ZERO(),
        );

    let quote = systems.contract.quote(kit_id, 1, false, 0);
    // referral_fee = 0 even though kit has 10% configured
    assert_eq!(quote.referral_fee, 0);
    assert_eq!(quote.total_cost, 1050);
}

#[test]
fn test_kit_quote_zero_price_all_fees_zero() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);

    let kit_id = register_free_kit(systems, ZERO());

    let quote = systems.contract.quote(kit_id, 1, true, 10);
    assert_eq!(quote.base_price, 0);
    assert_eq!(quote.referral_fee, 0);
    assert_eq!(quote.client_fee, 0);
    assert_eq!(quote.protocol_fee, 0);
    assert_eq!(quote.total_cost, 0);
}

// Tests - Not found (metadata)

#[test]
#[should_panic(expected: ('Kit: not found', 'ENTRYPOINT_FAILED'))]
fn test_kit_not_found_metadata() {
    let (_, systems) = spawn();
    systems.contract.get_metadata(99999);
}

// Tests - Update metadata

#[test]
fn test_kit_update_metadata() {
    let (world, systems) = spawn();
    set_block_timestamp(1);

    let kit_id = register_free_kit(systems, ZERO());

    set_contract_address(CREATOR());
    systems.contract.update_metadata(kit_id, "NEW_METADATA");

    let store = StoreTrait::new(world);
    let kit = store.get_kit(kit_id);
    assert_eq!(kit.metadata, "NEW_METADATA");
}

// Tests - Conditional wrong voucher key

#[test]
#[should_panic(expected: ('KitVoucher: not recipient', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_issue_wrong_voucher() {
    let (_, systems) = spawn();
    set_block_timestamp(1);

    let kit_id = register_free_kit(systems, CREATOR());

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);

    set_contract_address(PLAYER());
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some('WRONG_KEY'),
        );
}

#[test]
#[should_panic(expected: ('Kit: not allower', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_allow_not_allower() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, CREATOR());

    // [Allow] From PLAYER who is not the allower — should fail
    set_contract_address(PLAYER());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);
}

#[test]
#[should_panic(expected: ('KitVoucher: invalid key', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_allow_invalid_key() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, CREATOR());

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, 0);
}

#[test]
#[should_panic(expected: ('KitVoucher: invalid recipient', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_allow_invalid_recipient() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, CREATOR());

    set_contract_address(CREATOR());
    systems.contract.allow(0.try_into().unwrap(), kit_id, VOUCHER_KEY);
}

#[test]
#[should_panic(expected: ('KitVoucher: invalid key', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_issue_without_voucher() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, CREATOR());

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
        );
}

#[test]
#[should_panic(expected: ('KitVoucher: not recipient', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_issue_not_recipient() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, CREATOR());

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .contract
        .issue(
            recipient: CREATOR(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
        );
}

#[test]
#[should_panic(expected: ('KitVoucher: already claimed', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_issue_once() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let kit_id = systems
        .contract
        .register(
            referral_percentage: 0,
            reissuable: true,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: CREATOR(),
        );

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
        );

    set_block_timestamp(3);
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
        );
}

#[test]
#[should_panic(expected: ('KitVoucher: already claimed', 'ENTRYPOINT_FAILED'))]
fn test_kit_conditional_allow_already_claimed() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let kit_id = register_free_kit(systems, CREATOR());

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .contract
        .issue(
            recipient: PLAYER(),
            kit_id: kit_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
        );

    set_contract_address(CREATOR());
    systems.contract.allow(PLAYER(), kit_id, VOUCHER_KEY);
}
