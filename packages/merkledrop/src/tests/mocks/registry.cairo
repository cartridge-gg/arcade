use starknet::ContractAddress;

// Constants

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

#[starknet::interface]
pub trait IRegistry<TContractState> {
    fn register(
        ref self: TContractState, implementation: ContractAddress, data: Span<Span<felt252>>,
    ) -> felt252;
    fn claim(
        ref self: TContractState, tree_id: felt252, proofs: Span<felt252>, data: Span<felt252>,
    );
}

#[dojo::contract]
pub mod Registry {
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use crate::components::registrable::RegistrableComponent;
    use super::{IRegistry, NAMESPACE};

    // Components

    component!(path: RegistrableComponent, storage: registrable, event: RegistrableEvent);
    pub impl InternalImpl = RegistrableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub registrable: RegistrableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        RegistrableEvent: RegistrableComponent::Event,
    }

    #[abi(embed_v0)]
    pub impl RegistryImpl of IRegistry<ContractState> {
        fn register(
            ref self: ContractState, implementation: ContractAddress, data: Span<Span<felt252>>,
        ) -> felt252 {
            let world = self.world_storage();
            self.registrable.register(world, implementation, data)
        }

        fn claim(
            ref self: ContractState, tree_id: felt252, proofs: Span<felt252>, data: Span<felt252>,
        ) {
            let world = self.world_storage();
            self.registrable.claim(world, tree_id, proofs, data)
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
