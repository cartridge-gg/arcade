#[starknet::component]
pub mod ManageableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;
    use starknet::ContractAddress;

    // Internal imports

    use starterpack::constants::CONFIG_ID;
    use starterpack::models::config::{ConfigAssert, ConfigTrait, ConfigAssertTrait};
    use starterpack::models::moderator::{ModeratorAssert, ModeratorTrait};
    use starterpack::store::{
        ConfigStoreTrait, ModeratorStoreTrait, StoreTrait
    };
    use starterpack::types::role::Role;

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
        fn initialize(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            protocol_fee: u8,
            fee_receiver: ContractAddress,
            owner: ContractAddress,
        ) {
            // [Effect] Initialize moderator
            let mut store = StoreTrait::new(world);
            let moderator = ModeratorTrait::new(owner.into(), Role::Owner);
            store.set_moderator(@moderator);
            
            // [Effect] Initialize config
            let config = ConfigTrait::new(CONFIG_ID, protocol_fee, fee_receiver);
            store.set_config(@config);
        }

        fn grant_role(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            account: ContractAddress,
            role_id: u8,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = store.moderator(caller_address);
            let role: Role = role_id.into();
            caller_moderator.assert_is_allowed(role);
            // [Effect] Grant role
            let account_address: felt252 = account.into();
            let mut moderator = store.moderator(account_address);
            moderator.grant(role);
            // [Effect] Store moderator
            store.set_moderator(@moderator);
        }

        fn revoke_role(
            self: @ComponentState<TContractState>, world: WorldStorage, account: ContractAddress,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = store.moderator(caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Revoke role
            let account_address: felt252 = account.into();
            let mut moderator = store.moderator(account_address);
            moderator.revoke();
            // [Effect] Store moderator
            store.set_moderator(@moderator);
        }

        fn set_protocol_fee(
            self: @ComponentState<TContractState>, world: WorldStorage, fee_percentage: u8,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = store.moderator(caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set protocol fee
            let mut config = store.get_config(CONFIG_ID);
            config.assert_does_exist();
            ConfigTrait::set_protocol_fee(ref config, fee_percentage);
            store.set_config(@config);
        }

        fn set_fee_receiver(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            receiver: ContractAddress,
        ) {
            // [Setup] Datastore
            let mut store = StoreTrait::new(world);
            // [Check] Caller is allowed
            let caller_address: felt252 = starknet::get_caller_address().into();
            let caller_moderator = store.moderator(caller_address);
            caller_moderator.assert_is_allowed(Role::Owner);
            // [Effect] Set fee receiver
            let mut config = store.get_config(CONFIG_ID);
            config.assert_does_exist();
            ConfigTrait::set_fee_receiver(ref config, receiver);
            store.set_config(@config);
        }
    }
}

