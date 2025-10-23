// Internal imports

use arcade::systems::starterpack::IStarterpackRegistryDispatcherTrait;
use arcade::tests::setup::setup::{OWNER, PLAYER, spawn};
use openzeppelin_token::erc20::interface::IERC20DispatcherTrait;
use starknet::testing;
use starterpack::models::index::{GroupReward, ReferralReward, Starterpack};
use starterpack::store::{
    GroupRewardStoreTrait, ReferralRewardStoreTrait, StarterpackStoreTrait, StoreTrait,
};

// Constants

const PROTOCOL_FEE: u8 = 5; // 5%
const REFERRAL_PERCENTAGE: u8 = 10; // 10%
const PRICE: u256 = 1_000_000_000_000_000_000; // 1 token

// Tests

#[test]
fn test_sp_issue() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize] Protocol
    testing::set_contract_address(OWNER());

    // [Register] Starterpack
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

    // [Issue] Starterpack to player
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
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

    // [Assert] Total issued count incremented
    let mut store = StoreTrait::new(world);
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.total_issued, 1);
}

#[test]
fn test_sp_issue_with_referrer() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

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
            quantity: 1,
            referrer: Option::Some(context.holder),
            referrer_group: Option::None,
        );

    // [Assert] Referrer received fee (10% of PRICE)
    let referrer_fee = PRICE * REFERRAL_PERCENTAGE.into() / 100;
    let referrer_final = systems.erc20.balance_of(context.holder);
    assert_eq!(referrer_final - referrer_initial, referrer_fee);
}

#[test]
#[should_panic(expected: ('Issuance: already issued', 'ENTRYPOINT_FAILED'))]
fn test_sp_issue_not_reissuable() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    testing::set_block_timestamp(1);

    // [Register] Non-reissuable starterpack
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
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
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
        );

    // [Issue] Try again - should fail
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
        );
}

#[test]
fn test_sp_issue_reissuable() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

    // [Register] Reissuable starterpack
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
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
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
        );

    // [Issue] Second time - should succeed
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
        );

    // [Assert] Total issued is 2
    let mut store = StoreTrait::new(world);
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.total_issued, 2);
}

#[test]
#[should_panic(expected: ('Starterpack: not active', 'ENTRYPOINT_FAILED'))]
fn test_sp_issue_paused() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

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
            quantity: 1,
            referrer: Option::None,
            referrer_group: Option::None,
        );
}

#[test]
fn test_sp_referral_reward_tracking() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

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

    // [Issue] With referrer
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
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

    // [Assert] Referral reward tracked
    let mut store = StoreTrait::new(world);
    let referral_reward: ReferralReward = store.get_referral_reward(context.holder);

    let expected_fee = PRICE * REFERRAL_PERCENTAGE.into() / 100;
    assert_eq!(referral_reward.total_fees, expected_fee);
    assert_eq!(referral_reward.total_referrals, 1);
    assert_eq!(referral_reward.referrer, context.holder);
}

#[test]
fn test_sp_group_reward_tracking() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

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

    // [Issue] With referrer and group
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    let group_name = 'test_group';
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::Some(context.holder),
            referrer_group: Option::Some(group_name),
        );

    // [Assert] Group reward tracked
    let mut store = StoreTrait::new(world);
    let group_reward: GroupReward = store.get_group_reward(group_name);

    let expected_fee = PRICE * REFERRAL_PERCENTAGE.into() / 100;
    assert_eq!(group_reward.total_fees, expected_fee);
    assert_eq!(group_reward.total_referrals, 1);
    assert_eq!(group_reward.group, group_name);
}

#[test]
fn test_sp_multiple_referrals_accumulation() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

    // [Register] Reissuable starterpack
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true, // Make it reissuable for multiple purchases
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Issue] First purchase with referrer
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost * 3);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::Some(context.holder),
            referrer_group: Option::None,
        );

    // [Issue] Second purchase with same referrer
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::Some(context.holder),
            referrer_group: Option::None,
        );

    // [Assert] Referral rewards accumulated
    let mut store = StoreTrait::new(world);
    let referral_reward: ReferralReward = store.get_referral_reward(context.holder);

    let expected_fee_per_purchase = PRICE * REFERRAL_PERCENTAGE.into() / 100;
    assert_eq!(referral_reward.total_fees, expected_fee_per_purchase * 2);
    assert_eq!(referral_reward.total_referrals, 2);
}

#[test]
fn test_sp_group_multiple_referrals_accumulation() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

    // [Register] Reissuable starterpack
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    let group_name = 'awesome_group';

    // [Issue] First purchase
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost * 3);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::Some(context.holder),
            referrer_group: Option::Some(group_name),
        );

    // [Issue] Second purchase - same group
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: 1,
            referrer: Option::Some(context.holder),
            referrer_group: Option::Some(group_name),
        );

    // [Assert] Both individual and group rewards accumulated
    let mut store = StoreTrait::new(world);
    let referral_reward: ReferralReward = store.get_referral_reward(context.holder);
    let group_reward: GroupReward = store.get_group_reward(group_name);

    let expected_fee_per_purchase = PRICE * REFERRAL_PERCENTAGE.into() / 100;

    // Individual referrer should have 2 referrals
    assert_eq!(referral_reward.total_fees, expected_fee_per_purchase * 2);
    assert_eq!(referral_reward.total_referrals, 2);

    // Group should also have 2 referrals
    assert_eq!(group_reward.total_fees, expected_fee_per_purchase * 2);
    assert_eq!(group_reward.total_referrals, 2);
}

#[test]
fn test_sp_no_referral_tracking_without_referrer() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

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

    // [Issue] Without referrer
    testing::set_contract_address(context.spender);
    let total_cost = PRICE + (PRICE * PROTOCOL_FEE.into() / 100);
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

    // [Assert] No referral reward tracked
    let mut store = StoreTrait::new(world);
    let referral_reward: ReferralReward = store.get_referral_reward(context.holder);

    assert_eq!(referral_reward.total_fees, 0);
    assert_eq!(referral_reward.total_referrals, 0);
}

#[test]
fn test_sp_issue_with_quantity() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Issue] 5 starterpacks at once
    testing::set_contract_address(context.spender);
    let quantity: u32 = 5;
    let base_cost = PRICE * quantity.into();
    let total_cost = base_cost + (base_cost * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: quantity,
            referrer: Option::None,
            referrer_group: Option::None,
        );

    // [Assert] Total issued reflects quantity
    let mut store = StoreTrait::new(world);
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.total_issued, 5);
}

#[test]
fn test_sp_quote_with_quantity() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

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

    // [Quote] For quantity of 3
    let quantity: u32 = 3;
    let quote = systems.starterpack.quote(starterpack_id, quantity, false);

    // [Assert] Prices are multiplied by quantity
    let expected_base_price = PRICE * quantity.into();
    let expected_protocol_fee = expected_base_price * PROTOCOL_FEE.into() / 100;
    let expected_total = expected_base_price + expected_protocol_fee;

    assert_eq!(quote.base_price, expected_base_price);
    assert_eq!(quote.protocol_fee, expected_protocol_fee);
    assert_eq!(quote.total_cost, expected_total);
    assert_eq!(quote.referral_fee, 0);
}

#[test]
fn test_sp_quote_with_quantity_and_referrer() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

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

    // [Quote] For quantity of 3 with referrer
    let quantity: u32 = 3;
    let quote = systems.starterpack.quote(starterpack_id, quantity, true);

    // [Assert] Referral fee is calculated on total base price
    let expected_base_price = PRICE * quantity.into();
    let expected_referral_fee = expected_base_price * REFERRAL_PERCENTAGE.into() / 100;
    let expected_protocol_fee = expected_base_price * PROTOCOL_FEE.into() / 100;
    let expected_total = expected_base_price + expected_protocol_fee;

    assert_eq!(quote.base_price, expected_base_price);
    assert_eq!(quote.referral_fee, expected_referral_fee);
    assert_eq!(quote.protocol_fee, expected_protocol_fee);
    assert_eq!(quote.total_cost, expected_total);
}

#[test]
fn test_sp_issue_quantity_with_referrer() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    // [Record] Initial balances
    let referrer_initial = systems.erc20.balance_of(context.holder);
    let creator_initial = systems.erc20.balance_of(context.creator);

    // [Issue] 3 starterpacks with referrer
    testing::set_contract_address(context.spender);
    let quantity: u32 = 3;
    let base_cost = PRICE * quantity.into();
    let total_cost = base_cost + (base_cost * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: quantity,
            referrer: Option::Some(context.holder),
            referrer_group: Option::None,
        );

    // [Assert] Balances reflect quantity
    let referrer_final = systems.erc20.balance_of(context.holder);
    let creator_final = systems.erc20.balance_of(context.creator);

    let expected_referral_fee = base_cost * REFERRAL_PERCENTAGE.into() / 100;
    let expected_creator_payment = base_cost - expected_referral_fee;

    assert_eq!(referrer_final - referrer_initial, expected_referral_fee);
    assert_eq!(creator_final - creator_initial, expected_creator_payment);

    // [Assert] Referral tracking reflects quantity
    let mut store = StoreTrait::new(world);
    let referral_reward: ReferralReward = store.get_referral_reward(context.holder);
    assert_eq!(referral_reward.total_fees, expected_referral_fee);
    assert_eq!(referral_reward.total_referrals, 1); // 1 transaction, not 3

    // [Assert] Total issued reflects quantity
    let starterpack: Starterpack = store.get_starterpack(starterpack_id);
    assert_eq!(starterpack.total_issued, 3);
}

#[test]
fn test_sp_issue_quantity_group_rewards() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

    // [Register]
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
    let starterpack_id = systems
        .starterpack
        .register(
            implementation: systems.starterpack_impl,
            referral_percentage: REFERRAL_PERCENTAGE,
            reissuable: true,
            price: PRICE,
            payment_token: systems.erc20.contract_address,
            metadata: metadata,
        );

    let group_name = 'quantity_group';

    // [Issue] 4 starterpacks with group referrer
    testing::set_contract_address(context.spender);
    let quantity: u32 = 4;
    let base_cost = PRICE * quantity.into();
    let total_cost = base_cost + (base_cost * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: quantity,
            referrer: Option::Some(context.holder),
            referrer_group: Option::Some(group_name),
        );

    // [Assert] Group rewards track the full amount
    let mut store = StoreTrait::new(world);
    let group_reward: GroupReward = store.get_group_reward(group_name);

    let expected_fee = base_cost * REFERRAL_PERCENTAGE.into() / 100;
    assert_eq!(group_reward.total_fees, expected_fee);
    assert_eq!(group_reward.total_referrals, 1); // 1 transaction
}

#[test]
#[should_panic(expected: ('Starterpack: quantity > 1', 'ENTRYPOINT_FAILED'))]
fn test_sp_issue_quantity_exceeds_limit_non_reissuable() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());

    // [Register] Non-reissuable starterpack
    testing::set_contract_address(context.creator);
    let metadata =
        "{\"name\":\"Test Pack\",\"description\":\"Test\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Starter Item\",\"description\":\"A basic starter item\",\"image_uri\":\"https://example.com/item.png\"}]}";
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

    // [Issue] Try to issue quantity > 1 on non-reissuable - should fail
    testing::set_contract_address(context.spender);
    let quantity: u32 = 3;
    let base_cost = PRICE * quantity.into();
    let total_cost = base_cost + (base_cost * PROTOCOL_FEE.into() / 100);
    systems.erc20.approve(systems.starterpack.contract_address, total_cost);
    systems
        .starterpack
        .issue(
            recipient: PLAYER(),
            starterpack_id: starterpack_id,
            quantity: quantity, // This should fail
            referrer: Option::None,
            referrer_group: Option::None,
        );
}

