#[starknet::contract]
pub mod MerkleDropImplementation {
    use starknet::ContractAddress;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        claimed: Map<(felt252, felt252), bool>,
    }

    #[abi(embed_v0)]
    impl MerkleDropImpl of crate::interfaces::IMerkleDropImplementation<ContractState> {
        fn get_recipient(self: @ContractState, data: Span<felt252>) -> ContractAddress {
            let recipient: felt252 = *data[0];
            recipient.try_into().unwrap()
        }

        fn on_merkledrop_claim(
            ref self: ContractState, root: felt252, leaf: felt252, claimer: ContractAddress,
        ) {
            self.claimed.write((root, leaf), true);
        }
    }

    #[generate_trait]
    #[abi(per_item)]
    impl HelperImpl of HelperTrait {
        #[external(v0)]
        fn is_claimed(self: @ContractState, root: felt252, leaf: felt252) -> bool {
            self.claimed.read((root, leaf))
        }
    }
}
