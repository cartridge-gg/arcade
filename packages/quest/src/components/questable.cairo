#[starknet::component]
pub mod QuestableComponent {
    // Imports

    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use crate::models::completion::{CompletionAssert, CompletionTrait};
    use crate::models::definition::DefinitionAssert;
    use crate::store::{Store, StoreTrait};
    use crate::types::metadata::QuestMetadata;
    use crate::types::task::Task;

    // Errors

    mod errors {}

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>,
    > of InternalTrait<TContractState> {
        /// Check if a quest is completed
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `player_id`: The player identifier.
        /// * `quest_id`: The quest identifier.
        /// * `interval_id`: The interval identifier.
        ///
        /// # Returns
        ///
        /// * `true` if the quest is completed, `false` otherwise.
        fn is_completed(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) -> bool {
            let store: Store = StoreTrait::new(world);
            let completion = store.get_completion(player_id, quest_id, interval_id);
            completion.is_completed()
        }

        /// Check if a set of quests are completed
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `player_id`: The player identifier.
        /// * `quest_ids`: The quest identifiers.
        /// * `interval_id`: The interval identifier.
        ///
        /// # Returns
        ///
        /// * `true` if the quests are completed, `false` otherwise.
        fn are_completed(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            mut quest_ids: Array<felt252>,
            interval_id: u64,
        ) -> bool {
            let store: Store = StoreTrait::new(world);
            let mut completed = true;
            for quest_id in quest_ids {
                let completion = store.get_completion(player_id, quest_id, interval_id);
                completed = completed && completion.is_completed();
            }
            completed
        }

        /// Create an quest
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `id`: The quest identifier, it should be unique.
        /// * `rewarder`: The quest rewarder contract address used to reward the player.
        /// * `hidden`: Speicify if you want the quest to be hidden in the controller UI.
        /// * `index`: The quest index which the page of the quest group page.
        /// * `start`: The quest start timestamp, `0` for everlasting quests.
        /// * `end`: The quest end timestamp, `0` for everlasting quests.
        /// * `duration`: The quest duration in seconds.
        /// * `interval`: The quest interval in seconds.
        /// * `group`: The quest group, it should be used to group quests together.
        /// * `icon`: The quest icon, it should be a FontAwesome icon name (e.g. `fa-trophy`).
        /// * `title`: The quest title.
        /// * `description`: The quest global description.
        /// * `tasks`: The quest tasks (see also `Task` type).
        /// * `data`: The quest data, not used yet but could have a future use.
        /// * `to_store`: Speicify if you want to store the quest completion.
        fn create(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
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
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Event] Emit quest creation
            store
                .create(
                    id: id,
                    rewarder: rewarder,
                    start: start,
                    end: end,
                    duration: duration,
                    interval: interval,
                    tasks: tasks,
                    conditions: conditions,
                    metadata: metadata,
                    to_store: to_store,
                );
        }

        /// Progress on an quest
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `player_id`: The player identifier.
        /// * `task_id`: The task identifier.
        /// * `count`: The progression count to add.
        /// * `to_store`: Speicify if you want to store the quest completion.
        fn progress(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            task_id: felt252,
            count: u128,
            to_store: bool,
        ) {
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Event] Emit quest completion
            let time: u64 = starknet::get_block_timestamp();
            store.progress(player_id, task_id, count, time, to_store);
        }

        fn claim(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        ) {
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Check] Quest exists
            let definition = store.get_definition(quest_id);
            definition.assert_does_exist();

            // [Check] Player has completed the quest
            let mut completion = store.get_completion(player_id, quest_id, interval_id);
            completion.assert_is_completed();

            // [Check] Quest has not been claimed yet
            completion.assert_not_claimed();

            // [Effect] Claim quest
            completion.claim();
            store.set_completion(@completion);

            // [Event] Emit quest claim
            let time: u64 = starknet::get_block_timestamp();
            store
                .claim(
                    rewarder: definition.rewarder,
                    player_id: player_id,
                    quest_id: quest_id,
                    interval_id: interval_id,
                    time: time,
                );
        }
    }
}
