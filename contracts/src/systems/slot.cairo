// Interfaces

#[starknet::interface]
pub trait ISlot<TContractState> {
    fn deploy(ref self: TContractState, service: u8, project: felt252, tier: u8);
    fn remove(ref self: TContractState, service: u8, project: felt252);
    fn hire(ref self: TContractState, project: felt252, account_id: felt252, role: u8);
    fn fire(ref self: TContractState, project: felt252, account_id: felt252);
}

// Contracts

#[dojo::contract]
pub mod Slot {
    // Dojo imports

    // Internal imports

    use arcade::constants::NAMESPACE;
    use dojo::world::WorldStorage;

    // External imports

    use provider::components::deployable::DeployableComponent;
    use provider::components::groupable::GroupableComponent;

    // Local imports

    use super::ISlot;

    // Components

    component!(path: DeployableComponent, storage: deployable, event: DeployableEvent);
    impl DeployableImpl = DeployableComponent::InternalImpl<ContractState>;
    component!(path: GroupableComponent, storage: groupable, event: GroupableEvent);
    impl GroupableImpl = GroupableComponent::InternalImpl<ContractState>;

    // Storage

    #[storage]
    struct Storage {
        #[substorage(v0)]
        deployable: DeployableComponent::Storage,
        #[substorage(v0)]
        groupable: GroupableComponent::Storage,
    }

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        DeployableEvent: DeployableComponent::Event,
        #[flat]
        GroupableEvent: GroupableComponent::Event,
    }

    // Constructor

    fn dojo_init(ref self: ContractState) {
        self.deployable.initialize(self.world_storage());
    }

    // Implementations

    #[abi(embed_v0)]
    impl SlotImpl of ISlot<ContractState> {
        fn deploy(ref self: ContractState, service: u8, project: felt252, tier: u8) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.deployable.deploy(world, caller, service.into(), project, tier.into())
        }

        fn remove(ref self: ContractState, service: u8, project: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.deployable.remove(world, caller, service.into(), project);
        }

        fn hire(ref self: ContractState, project: felt252, account_id: felt252, role: u8) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.groupable.add(world, caller, project, account_id, role.into());
        }

        fn fire(ref self: ContractState, project: felt252, account_id: felt252) {
            let world = self.world_storage();
            let caller: felt252 = starknet::get_caller_address().into();
            self.groupable.remove(world, caller, project, account_id);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
