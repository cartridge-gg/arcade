// Internal imports

use starknet::ContractAddress;
use crate::types::metadata::QuestMetadata;
use crate::types::task::Task;

// Constants

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

#[starknet::interface]
pub trait IQuester<TContractState> {
    fn create(
        ref self: TContractState,
        id: felt252,
        rewarder: ContractAddress,
        start: u64,
        end: u64,
        duration: u64,
        interval: u64,
        tasks: Span<Task>,
        conditions: Span<felt252>,
        metadata: QuestMetadata,
        to_store: bool,
    );
    fn progress(
        ref self: TContractState, player_id: felt252, task_id: felt252, count: u128, to_store: bool,
    );
    fn claim(ref self: TContractState, player_id: felt252, quest_id: felt252, interval_id: u64);
}

#[dojo::contract]
pub mod Quester {
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use crate::components::questable::QuestableComponent;
    use crate::types::metadata::QuestMetadata;
    use crate::types::task::Task;
    use super::{IQuester, NAMESPACE};

    // Components

    component!(path: QuestableComponent, storage: questable, event: QuestableEvent);
    pub impl InternalImpl = QuestableComponent::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub questable: QuestableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        QuestableEvent: QuestableComponent::Event,
    }

    #[abi(embed_v0)]
    pub impl QuesterImpl of IQuester<ContractState> {
        fn create(
            ref self: ContractState,
            id: felt252,
            rewarder: ContractAddress,
            start: u64,
            end: u64,
            duration: u64,
            interval: u64,
            tasks: Span<Task>,
            conditions: Span<felt252>,
            metadata: QuestMetadata,
            to_store: bool,
        ) {
            self
                .questable
                .create(
                    self.world_storage(),
                    id,
                    rewarder,
                    start,
                    end,
                    duration,
                    interval,
                    tasks,
                    conditions,
                    metadata,
                    to_store,
                );
        }

        fn progress(
            ref self: ContractState,
            player_id: felt252,
            task_id: felt252,
            count: u128,
            to_store: bool,
        ) {
            self.questable.progress(self.world_storage(), player_id, task_id, count, to_store);
        }

        fn claim(ref self: ContractState, player_id: felt252, quest_id: felt252, interval_id: u64) {
            self.questable.claim(self.world_storage(), player_id, quest_id, interval_id);
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
