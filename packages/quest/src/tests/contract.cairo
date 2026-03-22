use quest::types::metadata::QuestMetadata;
use quest::types::task::Task;
use starknet::ContractAddress;

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

pub fn NAME() -> ByteArray {
    "Contract"
}

#[starknet::interface]
pub trait ContractTrait<TContractState> {
    fn is_completed(
        self: @TContractState, player_id: felt252, quest_id: felt252, interval_id: u64,
    ) -> bool;
    fn are_completed(
        self: @TContractState, player_id: felt252, quest_ids: Array<felt252>, interval_id: u64,
    ) -> bool;
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
    fn is_quest_completed(self: @TContractState, player_id: felt252, quest_id: felt252) -> bool;
    fn is_quest_claimed(self: @TContractState, player_id: felt252, quest_id: felt252) -> bool;
}

#[dojo::contract]
pub mod Contract {
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use crate::component::Component;
    use crate::component::Component::QuestTrait;
    use crate::types::metadata::QuestMetadata;
    use crate::types::task::Task;
    use super::{ContractTrait, NAMESPACE};

    component!(path: Component, storage: questable, event: QuestableEvent);
    pub impl InternalImpl = Component::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub questable: Component::Storage,
        completed: Map<(felt252, felt252), bool>,
        claimed: Map<(felt252, felt252), bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        QuestableEvent: Component::Event,
    }

    impl QuestImpl of QuestTrait<ContractState> {
        fn on_quest_unlock(
            ref self: Component::ComponentState<ContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            let _ = player_id;
            let _ = quest_id;
            let _ = interval_id;
        }

        fn on_quest_complete(
            ref self: Component::ComponentState<ContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            let _ = interval_id;
            let mut contract_state = self.get_contract_mut();
            contract_state.completed.write((player_id, quest_id), true);
        }

        fn on_quest_claim(
            ref self: Component::ComponentState<ContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            let _ = interval_id;
            let mut contract_state = self.get_contract_mut();
            contract_state.claimed.write((player_id, quest_id), true);
        }
    }

    #[abi(embed_v0)]
    pub impl ContractImpl of ContractTrait<ContractState> {
        fn is_completed(
            self: @ContractState, player_id: felt252, quest_id: felt252, interval_id: u64,
        ) -> bool {
            let world = self.world_storage();
            self.questable.is_completed(world, player_id, quest_id, interval_id)
        }

        fn are_completed(
            self: @ContractState, player_id: felt252, quest_ids: Array<felt252>, interval_id: u64,
        ) -> bool {
            let world = self.world_storage();
            self.questable.are_completed(world, player_id, quest_ids, interval_id)
        }

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
            let world = self.world_storage();
            self
                .questable
                .create(
                    world,
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
            let world = self.world_storage();
            self.questable.progress(world, player_id, task_id, count, to_store);
        }

        fn claim(ref self: ContractState, player_id: felt252, quest_id: felt252, interval_id: u64) {
            let world = self.world_storage();
            self.questable.claim(world, player_id, quest_id, interval_id);
        }

        fn is_quest_completed(self: @ContractState, player_id: felt252, quest_id: felt252) -> bool {
            self.completed.read((player_id, quest_id))
        }

        fn is_quest_claimed(self: @ContractState, player_id: felt252, quest_id: felt252) -> bool {
            self.claimed.read((player_id, quest_id))
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
