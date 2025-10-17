#[starknet::component]
pub mod ManageableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Shared RBAC imports
    use models::rbac::models::moderator::{ModeratorAssert, ModeratorTrait};
    use models::rbac::store::ModeratorStoreTrait;
    use models::rbac::types::role::Role;
    use starknet::ContractAddress;

    // Internal imports

    use starterpack::constants::CONFIG_ID;
    use starterpack::models::config::{ConfigAssert, ConfigAssertTrait, ConfigTrait};
    use starterpack::store::{ConfigStoreTrait, StoreTrait};

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        fn grant_role(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            account: ContractAddress,
            role_id: u8,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            let role: Role = role_id.into();
            caller_moderator.assert_is_allowed(role);
            // [Effect] Grant role
            let account_address: felt252 = account.into();
            let mut moderator = ModeratorStoreTrait::moderator(world, account_address);
            moderator.grant(role);
            // [Effect] Store moderator
            ModeratorStoreTrait::set_moderator(world, @moderator);
        }

        fn revoke_role(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            account: ContractAddress,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Revoke role
            let account_address: felt252 = account.into();
            let mut moderator = ModeratorStoreTrait::moderator(world, account_address);
            moderator.revoke();
            // [Effect] Store moderator
            ModeratorStoreTrait::set_moderator(world, @moderator);
        }

        fn set_protocol_fee(
            self: @ComponentState<TContractState>, world: WorldStorage, fee_percentage: u8,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set protocol fee
            let mut store = StoreTrait::new(world);
            let mut config = store.get_config(CONFIG_ID);
            config.assert_does_exist();
            ConfigTrait::set_protocol_fee(ref config, fee_percentage);
            store.set_config(@config);
        }

        fn set_fee_receiver(
            self: @ComponentState<TContractState>, world: WorldStorage, receiver: ContractAddress,
        ) {
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = ModeratorStoreTrait::moderator(world, caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set fee receiver
            let mut store = StoreTrait::new(world);
            let mut config = store.get_config(CONFIG_ID);
            config.assert_does_exist();
            ConfigTrait::set_fee_receiver(ref config, receiver);
            store.set_config(@config);
        }
    }
}

