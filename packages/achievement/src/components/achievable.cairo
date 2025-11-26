#[starknet::component]
pub mod AchievableComponent {
    // Imports

    use achievement::store::{Store, StoreTrait};
    use achievement::types::metadata::AchievementMetadata;
    use achievement::types::task::Task;
    use dojo::world::WorldStorage;
    use starknet::ContractAddress;
    use crate::interfaces::{IAchievementRewarderDispatcher, IAchievementRewarderDispatcherTrait};
    use crate::models::completion::{CompletionAssert, CompletionTrait};
    use crate::models::definition::DefinitionAssert;

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
        /// Create an achievement
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `id`: The achievement identifier, it should be unique.
        /// * `rewarder`: The achievement rewarder contract address used to reward the player.
        /// * `start`: The achievement start timestamp, `0` for everlasting achievements.
        /// * `end`: The achievement end timestamp, `0` for everlasting achievements.
        /// * `tasks`: The achievement tasks (see also `Task` type).
        /// * `metadata`: The achievement metadata (title, description, icon, points, hidden, index,
        /// group, data).
        /// * `to_store`: Specify if you want to store the achievement definition and completion.
        fn create(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            id: felt252,
            rewarder: ContractAddress,
            start: u64,
            end: u64,
            tasks: Span<Task>,
            metadata: AchievementMetadata,
            to_store: bool,
        ) {
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Event] Emit achievement creation
            store
                .create(
                    id: id,
                    rewarder: rewarder,
                    start: start,
                    end: end,
                    tasks: tasks,
                    metadata: metadata,
                    to_store: to_store,
                );
        }

        /// Progress on an achievement
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `player_id`: The player identifier.
        /// * `task_id`: The task identifier.
        /// * `count`: The progression count to add.
        /// * `to_store`: Specify if you want to store the achievement progression.
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

            // [Event] Emit achievement progression
            let time: u64 = starknet::get_block_timestamp();
            store
                .progress(
                    player_id: player_id,
                    task_id: task_id,
                    count: count,
                    time: time,
                    to_store: to_store,
                );
        }

        /// Claim an achievement
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `player_id`: The player identifier.
        /// * `achievement_id`: The achievement identifier.
        fn claim(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            achievement_id: felt252,
        ) {
            // [Setup] Store
            let store: Store = StoreTrait::new(world);

            // [Check] Achievement exists
            let definition = store.get_definition(achievement_id);
            definition.assert_does_exist();

            // [Check] Player has completed the achievement
            let mut completion = store.get_completion(player_id, achievement_id);
            completion.assert_is_completed();

            // [Check] Achievement has not been claimed yet
            completion.assert_not_claimed();

            // [Effect] Claim achievement
            completion.claim();
            store.set_completion(@completion);

            // [Interaction] Reward player
            let rewarder = IAchievementRewarderDispatcher { contract_address: definition.rewarder };
            rewarder.on_achievement_claim(player_id.try_into().unwrap(), achievement_id);

            // [Event] Emit achievement claim
            let time: u64 = starknet::get_block_timestamp();
            store.claim(player_id, achievement_id, time);
        }
    }
}
