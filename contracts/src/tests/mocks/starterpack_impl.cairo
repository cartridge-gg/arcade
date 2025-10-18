// Mock Starterpack Implementation for testing
// Simulates a simple implementation that tracks issued starterpacks

#[starknet::contract]
pub mod StarterpackImplementation {
    use starknet::ContractAddress;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        issued: Map<(ContractAddress, u32), bool>,
    }

    #[abi(embed_v0)]
    impl StarterpackImplementationImpl of starterpack::interface::IStarterpackImplementation<
        ContractState,
    > {
        fn on_issue(
            ref self: ContractState, recipient: ContractAddress, starterpack_id: u32, quantity: u32,
        ) {
            // Mark as issued (quantity is available for custom logic in real implementations)
            self.issued.write((recipient, starterpack_id), true);
        }
    }

    #[generate_trait]
    #[abi(per_item)]
    impl HelperImpl of HelperTrait {
        #[external(v0)]
        fn is_issued(
            self: @ContractState, recipient: ContractAddress, starterpack_id: u32,
        ) -> bool {
            self.issued.read((recipient, starterpack_id))
        }
    }
}

