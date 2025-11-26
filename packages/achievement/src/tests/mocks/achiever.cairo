// Internal imports

use achievement::types::metadata::AchievementMetadata;
use achievement::types::task::Task;
use starknet::ContractAddress;

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

#[starknet::interface]
pub trait IAchiever<TContractState> {
    fn create(
        self: @TContractState,
        id: felt252,
        rewarder: ContractAddress,
        start: u64,
        end: u64,
        tasks: Span<Task>,
        metadata: AchievementMetadata,
        to_store: bool,
    );
    fn progress(
        self: @TContractState, player_id: felt252, task_id: felt252, count: u128, to_store: bool,
    );
}

#[dojo::contract]
pub mod Achiever {
    // Imports

    use achievement::components::achievable::AchievableComponent;
    use achievement::types::metadata::AchievementMetadata;
    use achievement::types::task::Task;
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;

    // Local imports

    use super::{IAchiever, NAMESPACE};

    // Components

    component!(path: AchievableComponent, storage: achievable, event: AchievableEvent);
    pub impl InternalImpl = AchievableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub achievable: AchievableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AchievableEvent: AchievableComponent::Event,
    }

    #[abi(embed_v0)]
    pub impl AchieverImpl of IAchiever<ContractState> {
        fn create(
            self: @ContractState,
            id: felt252,
            rewarder: ContractAddress,
            start: u64,
            end: u64,
            tasks: Span<Task>,
            metadata: AchievementMetadata,
            to_store: bool,
        ) {
            self
                .achievable
                .create(self.world_storage(), id, rewarder, start, end, tasks, metadata, to_store);
        }

        fn progress(
            self: @ContractState, player_id: felt252, task_id: felt252, count: u128, to_store: bool,
        ) {
            self.achievable.progress(self.world_storage(), player_id, task_id, count, to_store);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
