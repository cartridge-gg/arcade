#[starknet::component]
pub mod InitializableComponent {
    // Dojo imports

    use dojo::world::WorldStorage;

    // Shared RBAC imports
    use models::rbac::models::moderator::ModeratorTrait;
    use models::rbac::store::ModeratorStoreTrait;
    use models::rbac::types::role::Role;
    use starknet::ContractAddress;

    // Internal imports

    use starterpack::constants::CONFIG_ID;
    use starterpack::models::config::ConfigTrait;
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
        fn initialize(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            protocol_fee: u8,
            fee_receiver: ContractAddress,
            owner: ContractAddress,
        ) {
            // [Effect] Initialize moderator
            let moderator = ModeratorTrait::new(owner.into(), Role::Owner);
            ModeratorStoreTrait::set_moderator(world, @moderator);

            // [Effect] Initialize config
            let mut store = StoreTrait::new(world);
            let config = ConfigTrait::new(CONFIG_ID, protocol_fee, fee_receiver);
            store.set_config(@config);
        }
    }
}

