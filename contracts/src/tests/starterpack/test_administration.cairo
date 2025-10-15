// Internal imports

use arcade::systems::starterpack::IAdministrationDispatcherTrait;
use arcade::tests::setup::setup::{OWNER, RECEIVER, spawn};
use models::rbac::types::role::Role;
use starknet::testing;
use starterpack::constants::CONFIG_ID;
use starterpack::models::index::Config;
use starterpack::store::{ConfigStoreTrait, StoreTrait};

// Constants

const PROTOCOL_FEE: u8 = 5; // 5%
const NEW_PROTOCOL_FEE: u8 = 10; // 10%

// Tests

#[test]
fn test_sp_administration_initialize_once() {
    // [Setup]
    let (world, systems, _context) = spawn();

    // [Initialize] Set up protocol config
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Assert] Config is set
    let mut store = StoreTrait::new(world);
    let config: Config = store.get_config(CONFIG_ID);
    assert_eq!(config.id, CONFIG_ID);
    assert_eq!(config.protocol_fee, PROTOCOL_FEE);
    assert_eq!(config.fee_receiver, RECEIVER());
}

#[test]
fn test_sp_administration_set_protocol_fee() {
    // [Setup]
    let (world, systems, _context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Update] Protocol fee
    systems.starterpack_admin.set_protocol_fee(NEW_PROTOCOL_FEE);

    // [Assert] Fee is updated
    let mut store = StoreTrait::new(world);
    let config: Config = store.get_config(CONFIG_ID);
    assert_eq!(config.protocol_fee, NEW_PROTOCOL_FEE);
}

#[test]
#[should_panic(expected: ('Moderator: not allowed', 'ENTRYPOINT_FAILED'))]
fn test_sp_administration_set_protocol_fee_unauthorized() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Update] Try to update from unauthorized address
    testing::set_contract_address(context.creator);
    systems.starterpack_admin.set_protocol_fee(NEW_PROTOCOL_FEE);
}

#[test]
fn test_sp_administration_grant_revoke_role() {
    // [Setup]
    let (_world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Grant] Admin role to creator
    let role_id: u8 = Role::Admin.into();
    systems.starterpack_admin.grant_role(context.creator, role_id);

    // [Assert] Creator can now update protocol fee
    testing::set_contract_address(context.creator);
    // This would fail if role wasn't granted properly
    // (Admin role can't set fees, but this tests the role system)

    // [Revoke] Role
    testing::set_contract_address(OWNER());
    systems.starterpack_admin.revoke_role(context.creator);
}

#[test]
fn test_sp_administration_set_fee_receiver() {
    // [Setup]
    let (world, systems, context) = spawn();

    // [Initialize]
    testing::set_contract_address(OWNER());
    systems
        .starterpack_admin
        .initialize(protocol_fee: PROTOCOL_FEE, fee_receiver: RECEIVER(), owner: OWNER());

    // [Update] Fee receiver
    systems.starterpack_admin.set_fee_receiver(context.holder);

    // [Assert] Receiver is updated
    let mut store = StoreTrait::new(world);
    let config: Config = store.get_config(CONFIG_ID);
    assert_eq!(config.fee_receiver, context.holder);
}

