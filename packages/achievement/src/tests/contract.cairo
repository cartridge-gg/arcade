// Internal imports

use crate::types::metadata::AchievementMetadata;
use crate::types::task::Task;

pub fn NAMESPACE() -> ByteArray {
    "NAMESPACE"
}

pub fn NAME() -> ByteArray {
    "Contract"
}

#[starknet::interface]
pub trait ContractTrait<TContractState> {
    fn achievement_completed(
        self: @TContractState, player_id: felt252, achievement_id: felt252,
    ) -> bool;
    fn achievements_completed(
        self: @TContractState, player_id: felt252, achievement_ids: Array<felt252>,
    ) -> bool;
    fn create(
        ref self: TContractState,
        id: felt252,
        start: u64,
        end: u64,
        tasks: Span<Task>,
        metadata: AchievementMetadata,
        to_store: bool,
    );
    fn progress(
        ref self: TContractState, player_id: felt252, task_id: felt252, count: u128, to_store: bool,
    );
    fn claim(ref self: TContractState, player_id: felt252, achievement_id: felt252);
    fn is_completed(self: @TContractState, player_id: felt252, achievement_id: felt252) -> bool;
    fn is_claimed(self: @TContractState, player_id: felt252, achievement_id: felt252) -> bool;
}

#[dojo::contract]
pub mod Contract {
    // Imports

    use dojo::world::WorldStorage;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use crate::component::Component;
    use crate::component::Component::AchievementTrait;
    use crate::types::metadata::AchievementMetadata;
    use crate::types::task::Task;
    use super::{ContractTrait, NAMESPACE};

    // Components

    component!(path: Component, storage: achievable, event: AchievableEvent);
    pub impl InternalImpl = Component::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        pub achievable: Component::Storage,
        completed: Map<(felt252, felt252), bool>,
        claimed: Map<(felt252, felt252), bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AchievableEvent: Component::Event,
    }

    impl AchievementImpl of AchievementTrait<ContractState> {
        fn on_completion(
            ref self: Component::ComponentState<ContractState>,
            player_id: felt252,
            achievement_id: felt252,
        ) {
            let mut contract_state = self.get_contract_mut();
            contract_state.completed.write((player_id, achievement_id), true);
        }

        fn on_claim(
            ref self: Component::ComponentState<ContractState>,
            player_id: felt252,
            achievement_id: felt252,
        ) {
            let mut contract_state = self.get_contract_mut();
            contract_state.claimed.write((player_id, achievement_id), true);
        }
    }

    #[abi(embed_v0)]
    pub impl ContractImpl of ContractTrait<ContractState> {
        fn achievement_completed(
            self: @ContractState, player_id: felt252, achievement_id: felt252,
        ) -> bool {
            let world = self.world_storage();
            self.achievable.is_completed(world, player_id, achievement_id)
        }

        fn achievements_completed(
            self: @ContractState, player_id: felt252, achievement_ids: Array<felt252>,
        ) -> bool {
            let world = self.world_storage();
            self.achievable.are_completed(world, player_id, achievement_ids)
        }

        fn create(
            ref self: ContractState,
            id: felt252,
            start: u64,
            end: u64,
            tasks: Span<Task>,
            metadata: AchievementMetadata,
            to_store: bool,
        ) {
            self.achievable.create(self.world_storage(), id, start, end, tasks, metadata, to_store);
        }

        fn progress(
            ref self: ContractState,
            player_id: felt252,
            task_id: felt252,
            count: u128,
            to_store: bool,
        ) {
            self.achievable.progress(self.world_storage(), player_id, task_id, count, to_store);
        }

        fn claim(ref self: ContractState, player_id: felt252, achievement_id: felt252) {
            let world = self.world_storage();
            self.achievable.claim(world, player_id, achievement_id);
        }

        fn is_completed(self: @ContractState, player_id: felt252, achievement_id: felt252) -> bool {
            self.completed.read((player_id, achievement_id))
        }

        fn is_claimed(self: @ContractState, player_id: felt252, achievement_id: felt252) -> bool {
            self.claimed.read((player_id, achievement_id))
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn world_storage(self: @ContractState) -> WorldStorage {
            self.world(@NAMESPACE())
        }
    }
}
