// Constants

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

pub fn NAME() -> ByteArray {
    "Contract"
}

#[starknet::interface]
pub trait ContractTrait<TContractState> {
    fn register(ref self: TContractState, data: Span<Span<felt252>>, end: u64) -> felt252;
    fn claim(
        ref self: TContractState,
        tree_id: felt252,
        proofs: Span<felt252>,
        data: Span<felt252>,
        receiver: starknet::ContractAddress,
    );
    fn is_claimed(self: @TContractState, root: felt252, leaf: felt252) -> bool;
}

#[dojo::contract]
pub mod Contract {
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use crate::component::Component;
    use crate::component::Component::MerkledropTrait;
    use super::{ContractTrait, NAMESPACE};

    // Components

    component!(path: Component, storage: merkledrop, event: MerkledropEvent);
    pub impl InternalImpl = Component::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub merkledrop: Component::Storage,
        claimed: Map<(felt252, felt252), bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        MerkledropEvent: Component::Event,
    }

    impl MerkledropImpl of MerkledropTrait<ContractState> {
        fn get_recipient(
            self: @Component::ComponentState<ContractState>, data: Span<felt252>,
        ) -> ContractAddress {
            let recipient: felt252 = *data[0];
            recipient.try_into().unwrap()
        }

        fn on_merkledrop_claim(
            ref self: Component::ComponentState<ContractState>,
            root: felt252,
            leaf: felt252,
            receiver: ContractAddress,
            data: Span<felt252>,
        ) {
            let mut contract_state = self.get_contract_mut();
            contract_state.claimed.write((root, leaf), true);
        }
    }

    #[abi(embed_v0)]
    pub impl ContractImpl of ContractTrait<ContractState> {
        fn register(ref self: ContractState, data: Span<Span<felt252>>, end: u64) -> felt252 {
            let world = self.world_storage();
            self.merkledrop.register(world, data, end)
        }

        fn claim(
            ref self: ContractState,
            tree_id: felt252,
            proofs: Span<felt252>,
            data: Span<felt252>,
            receiver: ContractAddress,
        ) {
            let world = self.world_storage();
            self.merkledrop.claim(world, tree_id, proofs, data, receiver)
        }

        fn is_claimed(self: @ContractState, root: felt252, leaf: felt252) -> bool {
            self.claimed.read((root, leaf))
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
