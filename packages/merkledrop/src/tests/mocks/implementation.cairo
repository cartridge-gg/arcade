#[starknet::interface]
pub trait IHelper<TContractState> {
    fn is_claimed(self: @TContractState, root: felt252, leaf: felt252) -> bool;
}

#[starknet::contract]
pub mod MerkleDropImplementation {
    use starknet::ContractAddress;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        claimed: Map<(felt252, felt252), bool>,
    }

    #[abi(embed_v0)]
    impl MerkleDropImpl of crate::interfaces::IMerkledropImplementation<ContractState> {
        fn get_recipient(self: @ContractState, data: Span<felt252>) -> ContractAddress {
            let recipient: felt252 = *data[0];
            recipient.try_into().unwrap()
        }

        fn on_merkledrop_claim(
            ref self: ContractState,
            root: felt252,
            leaf: felt252,
            recipient: ContractAddress,
            data: Span<felt252>,
        ) {
            self.claimed.write((root, leaf), true);
        }
    }

    #[abi(embed_v0)]
    impl HelperImpl of super::IHelper<ContractState> {
        fn is_claimed(self: @ContractState, root: felt252, leaf: felt252) -> bool {
            self.claimed.read((root, leaf))
        }
    }
}
