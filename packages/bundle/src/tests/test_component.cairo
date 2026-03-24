use starknet::testing::{set_block_timestamp, set_contract_address};
use crate::interface::IBundleDispatcherTrait;
use crate::models::bundle::BundleAssert;
use crate::store::{BundleStoreTrait, IssuanceStoreTrait, StoreTrait};
use crate::tests::contract::ContractTraitDispatcherTrait;
use crate::tests::setup::setup::{CREATOR, METADATA, PAYMENT_TOKEN, PLAYER, Systems, spawn};

const VOUCHER_KEY: felt252 = 'VOUCHER_KEY';
use starknet::ContractAddress;

fn ZERO() -> ContractAddress {
    0.try_into().unwrap()
}

// Pre-computed ECDSA signatures for SNIP-12 Message { bundle_id, voucher_key, recipient }
// Signed with private key 0x040971f817af8710f6e89f4ebde09bf2d1f45dced7fee9405fad453b42aaac68

// bundle_id=0, voucher_key=VOUCHER_KEY, recipient=PLAYER
fn SIG_VK_PLAYER() -> Span<felt252> {
    array![
        0x7eafe3db6d7f274f894d699c53412426f99bccbbc28efb7c52ac2dca98505bc,
        0x719b725ffecba048d86c832f8d9ceb938312c98f2ac9d81a88b5a236d7eef61,
    ]
        .span()
}

fn SIG_VK_CREATOR() -> Span<felt252> {
    array![
        0x66f375a55372a01dc2fb87bba8fd05c16943499b3e16a9683abd5c46b3a32be,
        0x29cdd9629227c9a497c81f1e48b23ee92eec150b1476f9f4d27b3524bc310b9,
    ]
        .span()
}

fn SIG_WK_PLAYER() -> Span<felt252> {
    array![
        0x26baa57d322e71b2b556a6e814e2fb18b47fb9a91d7975052f5347d1ee7b20d,
        0x320ba30262c608860e7dc1aa715a910e1d01f79b7d510a9f58c83ca8c922430,
    ]
        .span()
}

fn register_free_bundle(systems: Systems, allower: ContractAddress) -> u32 {
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
fn test_bundle_register() {
    let (world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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
    let bundle = store.get_bundle(bundle_id);
    bundle.assert_does_exist();
    assert_eq!(bundle.payment_receiver, CREATOR());
}

#[test]
fn test_bundle_register_multiple() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);

    let bundle_1 = register_free_bundle(systems, ZERO());
    let bundle_2 = register_free_bundle(systems, ZERO());

    assert_ne!(bundle_1, bundle_2);
}

#[test]
#[should_panic(expected: ('Bundle: referral too high', 'ENTRYPOINT_FAILED'))]
fn test_bundle_register_invalid_referral() {
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
#[should_panic(expected: ('Bundle: not found', 'ENTRYPOINT_FAILED'))]
fn test_bundle_not_found_quote() {
    let (_world, systems) = spawn();
    let _ = systems.bundle.quote(99999, 1, false, 0);
}

#[test]
#[should_panic(expected: ('Bundle: not found', 'ENTRYPOINT_FAILED'))]
fn test_bundle_not_found_update() {
    let (_world, systems) = spawn();

    systems
        .contract
        .update(
            bundle_id: 99999,
            referral_percentage: 10,
            reissuable: true,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: PLAYER(),
            allower: CREATOR(),
        );
}

#[test]
fn test_bundle_update() {
    let (world, systems) = spawn();
    set_block_timestamp(1);

    let bundle_id = register_free_bundle(systems, ZERO());

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .contract
        .update(
            bundle_id: bundle_id,
            referral_percentage: 15,
            reissuable: true,
            price: 1234,
            payment_token: PLAYER(),
            payment_receiver: PLAYER(),
            allower: CREATOR(),
        );

    let store = StoreTrait::new(world);
    let bundle = store.get_bundle(bundle_id);
    assert_eq!(bundle.referral_percentage, 15);
    assert_eq!(bundle.reissuable, true);
    assert_eq!(bundle.price, 1234);
    assert_eq!(bundle.payment_token, PLAYER());
    assert_eq!(bundle.payment_receiver, PLAYER());
    assert_eq!(bundle.allower, CREATOR());
}

#[test]
fn test_bundle_quote() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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

    let quote = systems.bundle.quote(bundle_id, 1, false, 0);
    let expected_base: u256 = 1000;
    let expected_referral: u256 = 0;
    assert_eq!(quote.base_price, expected_base);
    assert_eq!(quote.referral_fee, expected_referral);
}

#[test]
fn test_bundle_quote_with_referrer() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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

    let quote = systems.bundle.quote(bundle_id, 3, true, 0);
    let expected_base: u256 = 3000;
    let expected_referral: u256 = 300;
    assert_eq!(quote.base_price, expected_base);
    assert_eq!(quote.referral_fee, expected_referral);
}

#[test]
fn test_bundle_issue() {
    let (world, systems) = spawn();
    set_block_timestamp(1);
    let bundle_id = register_free_bundle(systems, ZERO());

    set_block_timestamp(2);
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
            signature: Option::None,
        );

    let store = StoreTrait::new(world);
    let issuance = store.get_issuance(bundle_id, PLAYER());
    assert_gt!(issuance.issued_at, 0);
}

#[test]
#[should_panic(expected: ('BundleIssuance: already issued', 'ENTRYPOINT_FAILED'))]
fn test_bundle_issue_not_reissuable() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let bundle_id = register_free_bundle(systems, ZERO());

    set_block_timestamp(2);
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
            signature: Option::None,
        );

    set_block_timestamp(3);
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
            signature: Option::None,
        );
}

#[test]
fn test_bundle_issue_reissuable() {
    let (world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
            signature: Option::None,
        );

    set_block_timestamp(3);
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
            signature: Option::None,
        );

    let store = StoreTrait::new(world);
    let bundle = store.get_bundle(bundle_id);
    assert_eq!(bundle.total_issued, 2);
}

#[test]
#[should_panic(expected: ('Bundle: quantity > 1', 'ENTRYPOINT_FAILED'))]
fn test_bundle_issue_quantity_exceeds_limit() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let bundle_id = register_free_bundle(systems, ZERO());

    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 3,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
            signature: Option::None,
        );
}

#[test]
fn test_bundle_conditional_issue() {
    let (world, systems) = spawn();
    set_block_timestamp(1);
    let bundle_id = register_free_bundle(systems, systems.allower.contract_address);

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
            signature: Option::Some(SIG_VK_PLAYER()),
        );

    let store = StoreTrait::new(world);
    let issuance = store.get_issuance(bundle_id, PLAYER());
    assert_gt!(issuance.issued_at, 0);
}

// Tests - Quote with fees

#[test]
fn test_bundle_quote_no_fees() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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
    let quote = systems.bundle.quote(bundle_id, 1, false, 0);
    assert_eq!(quote.base_price, 1000);
    assert_eq!(quote.referral_fee, 0);
    assert_eq!(quote.client_fee, 0);
    // protocol_fee = 5% of 1000 = 50
    assert_eq!(quote.protocol_fee, 50);
    // total_cost = base + protocol + client = 1000 + 50 + 0 = 1050
    assert_eq!(quote.total_cost, 1050);
}

#[test]
fn test_bundle_quote_referral_fee() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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
    let quote = systems.bundle.quote(bundle_id, 1, true, 0);
    assert_eq!(quote.base_price, 1000);
    // referral_fee = 10% of 1000 = 100
    assert_eq!(quote.referral_fee, 100);
    assert_eq!(quote.client_fee, 0);
    assert_eq!(quote.protocol_fee, 50);
    // total_cost = base + protocol + client = 1000 + 50 + 0 = 1050 (referral doesn't inflate)
    assert_eq!(quote.total_cost, 1050);
}

#[test]
fn test_bundle_quote_client_fee() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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
    let quote = systems.bundle.quote(bundle_id, 1, false, 5);
    assert_eq!(quote.base_price, 1000);
    assert_eq!(quote.referral_fee, 0);
    // client_fee = 5% of 1000 = 50
    assert_eq!(quote.client_fee, 50);
    assert_eq!(quote.protocol_fee, 50);
    // total_cost = base + protocol + client = 1000 + 50 + 50 = 1100
    assert_eq!(quote.total_cost, 1100);
}

#[test]
fn test_bundle_quote_all_fees() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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
    let quote = systems.bundle.quote(bundle_id, 1, true, 5);
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
fn test_bundle_quote_all_fees_with_quantity() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
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
    let quote = systems.bundle.quote(bundle_id, 5, true, 5);
    assert_eq!(quote.base_price, 5000);
    assert_eq!(quote.referral_fee, 500);
    assert_eq!(quote.client_fee, 250);
    assert_eq!(quote.protocol_fee, 250);
    assert_eq!(quote.total_cost, 5500);
}

#[test]
fn test_bundle_quote_no_referrer_means_zero_referral_fee() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    // Bundle has 10% referral configured but no referrer in quote
    let bundle_id = systems
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

    let quote = systems.bundle.quote(bundle_id, 1, false, 0);
    // referral_fee = 0 even though bundle has 10% configured
    assert_eq!(quote.referral_fee, 0);
    assert_eq!(quote.total_cost, 1050);
}

#[test]
fn test_bundle_quote_zero_price_all_fees_zero() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);

    let bundle_id = register_free_bundle(systems, ZERO());

    let quote = systems.bundle.quote(bundle_id, 1, true, 10);
    assert_eq!(quote.base_price, 0);
    assert_eq!(quote.referral_fee, 0);
    assert_eq!(quote.client_fee, 0);
    assert_eq!(quote.protocol_fee, 0);
    assert_eq!(quote.total_cost, 0);
}

// Tests - Not found (metadata)

#[test]
#[should_panic(expected: ('Bundle: not found', 'ENTRYPOINT_FAILED'))]
fn test_bundle_not_found_metadata() {
    let (_, systems) = spawn();
    systems.bundle.get_metadata(99999);
}

// Tests - Update metadata

#[test]
fn test_bundle_update_metadata() {
    let (world, systems) = spawn();
    set_block_timestamp(1);

    let bundle_id = register_free_bundle(systems, ZERO());

    set_contract_address(CREATOR());
    systems.contract.update_metadata(bundle_id, "NEW_METADATA");

    let store = StoreTrait::new(world);
    let bundle = store.get_bundle(bundle_id);
    assert_eq!(bundle.metadata, "NEW_METADATA");
}

// Tests - Conditional wrong voucher key

#[test]
#[should_panic(expected: ('Voucher: invalid signature', 'ENTRYPOINT_FAILED'))]
fn test_bundle_conditional_issue_wrong_voucher() {
    let (_, systems) = spawn();
    set_block_timestamp(1);

    let bundle_id = register_free_bundle(systems, systems.allower.contract_address);

    set_contract_address(PLAYER());
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some('WRONG_KEY'),
            signature: Option::Some(
                SIG_VK_PLAYER(),
            ) // Sig for VOUCHER_KEY, not WRONG_KEY → invalid
        );
}

#[test]
#[should_panic(expected: ('Voucher: key is required', 'ENTRYPOINT_FAILED'))]
fn test_bundle_conditional_issue_without_voucher() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let bundle_id = register_free_bundle(systems, systems.allower.contract_address);

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::None,
            signature: Option::Some(array![0x1, 0x2].span()),
        );
}

#[test]
#[should_panic(expected: ('Voucher: invalid signature', 'ENTRYPOINT_FAILED'))]
fn test_bundle_conditional_issue_wrong_recipient_sig() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    let bundle_id = register_free_bundle(systems, systems.allower.contract_address);

    // Signature was signed for PLAYER as recipient, but we issue for CREATOR → hash mismatch
    set_block_timestamp(2);
    set_contract_address(CREATOR());
    systems
        .bundle
        .issue(
            recipient: CREATOR(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
            signature: Option::Some(
                SIG_VK_PLAYER(),
            ) // Sig for PLAYER, used with CREATOR → invalid
        );
}

#[test]
#[should_panic(expected: ('Voucher: already claimed', 'ENTRYPOINT_FAILED'))]
fn test_bundle_conditional_issue_once() {
    let (_world, systems) = spawn();
    set_block_timestamp(1);
    set_contract_address(CREATOR());

    let bundle_id = systems
        .contract
        .register(
            referral_percentage: 0,
            reissuable: true,
            price: 0,
            payment_token: PAYMENT_TOKEN(),
            payment_receiver: CREATOR(),
            metadata: METADATA(),
            allower: systems.allower.contract_address,
        );

    set_block_timestamp(2);
    set_contract_address(PLAYER());
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
            signature: Option::Some(SIG_VK_PLAYER()),
        );

    set_block_timestamp(3);
    systems
        .bundle
        .issue(
            recipient: PLAYER(),
            bundle_id: bundle_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
            client: Option::None,
            client_percentage: 0,
            voucher_key: Option::Some(VOUCHER_KEY),
            signature: Option::Some(SIG_VK_PLAYER()),
        );
}

