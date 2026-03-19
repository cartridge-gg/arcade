use starknet::ContractAddress;

// Constants

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

pub fn NAME() -> ByteArray {
    "Registry"
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
    use crate::components::merkledrop::MerkledropComponent;
    use super::{IRegistry, NAMESPACE};

    // Components

    component!(path: MerkledropComponent, storage: merkledrop, event: MerkledropEvent);
    pub impl InternalImpl = MerkledropComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub merkledrop: MerkledropComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        MerkledropEvent: MerkledropComponent::Event,
    }

    #[abi(embed_v0)]
    pub impl MerkledropImpl of IRegistry<ContractState> {
        fn register(
            ref self: ContractState, implementation: ContractAddress, data: Span<Span<felt252>>,
        ) -> felt252 {
            let world = self.world_storage();
            self.merkledrop.register(world, implementation, data)
        }

        fn claim(
            ref self: ContractState, tree_id: felt252, proofs: Span<felt252>, data: Span<felt252>,
        ) {
            let world = self.world_storage();
            self.merkledrop.claim(world, tree_id, proofs, data)
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
