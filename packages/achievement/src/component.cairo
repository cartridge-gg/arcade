#[starknet::component]
pub mod Component {
    // Imports

    use achievement::store::{Store, StoreTrait};
    use achievement::types::metadata::AchievementMetadata;
    use achievement::types::task::Task;
    use dojo::event::EventStorage;
    use dojo::world::WorldStorage;
    use crate::events::creation::{CreationTrait, TrophyCreation};
    use crate::events::index::TrophyProgression;
    use crate::events::progress::ProgressTrait;
    use crate::models::advancement::AdvancementTrait;
    use crate::models::association::AssociationTrait;
    use crate::models::completion::{CompletionAssert, CompletionTrait};
    use crate::models::definition::{AchievementDefinition, DefinitionAssert, DefinitionTrait};

    // Errors

    mod Errors {}

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    // Hooks

    pub trait AchievementTrait<TContractState> {
        fn on_completion(
            ref self: ComponentState<TContractState>, player_id: felt252, achievement_id: felt252,
        );
        fn on_claim(
            ref self: ComponentState<TContractState>, player_id: felt252, achievement_id: felt252,
        );
    }

    // Implementations

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl AchievementImpl: AchievementTrait<TContractState>,
    > of InternalTrait<TContractState> {
        fn is_completed(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            achievement_id: felt252,
        ) -> bool {
            let store: Store = StoreTrait::new(world);
            let completion = store.get_completion(player_id, achievement_id);
            completion.is_completed()
        }

        fn are_completed(
            self: @ComponentState<TContractState>,
            world: WorldStorage,
            player_id: felt252,
            mut achievement_ids: Array<felt252>,
        ) -> bool {
            let store: Store = StoreTrait::new(world);
            let mut completed = true;
            for achievement_id in achievement_ids {
                let completion = store.get_completion(player_id, achievement_id);
                completed = completed && completion.is_completed();
            }
            completed
        }

        /// Create an achievement
        ///
        /// # Arguments
        ///
        /// * `self`: The component state.
        /// * `world`: The world storage.
        /// * `id`: The achievement identifier, it should be unique.
        /// * `start`: The achievement start timestamp, `0` for everlasting achievements.
        /// * `end`: The achievement end timestamp, `0` for everlasting achievements.
        /// * `tasks`: The achievement tasks (see also `Task` type).
        /// * `metadata`: The achievement metadata (title, description, icon, points, hidden, index,
        /// group, data).
        /// * `to_store`: Specify if you want to store the achievement definition and completion.
        fn create(
            self: @ComponentState<TContractState>,
            mut world: WorldStorage,
            id: felt252,
            start: u64,
            end: u64,
            mut tasks: Span<Task>,
            metadata: AchievementMetadata,
            to_store: bool,
        ) {
            // [Event] Emit achievement creation
            let event: TrophyCreation = CreationTrait::new(
                id: id,
                hidden: metadata.hidden,
                index: metadata.index,
                points: metadata.points,
                start: start,
                end: end,
                group: metadata.group,
                icon: metadata.icon,
                title: metadata.title,
                description: metadata.description,
                tasks: tasks,
                data: metadata.data,
            );
            world.emit_event(@event);

            // [Check] Skip if storing is not requested
            if (!to_store) {
                return;
            }

            // [Model] Create achievement definition
            let store: Store = StoreTrait::new(world);
            let definition: AchievementDefinition = DefinitionTrait::new(
                id: id, start: start, end: end, tasks: tasks,
            );
            store.set_definition(@definition);

            // [Effect] Update associations
            while let Option::Some(task) = tasks.pop_front() {
                let mut association = store.get_association(*task.id);
                association.insert(id);
                store.set_association(@association);
            }
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
            ref self: ComponentState<TContractState>,
            mut world: WorldStorage,
            player_id: felt252,
            task_id: felt252,
            count: u128,
            to_store: bool,
        ) {
            // [Event] Emit achievement progression
            let time: u64 = starknet::get_block_timestamp();
            let event: TrophyProgression = ProgressTrait::new(
                player_id: player_id, task_id: task_id, count: count, time: time,
            );
            world.emit_event(@event);

            // [Check] Skip if storing is not requested
            if (!to_store) {
                return;
            }

            // [Effect] Update player advancement
            let store: Store = StoreTrait::new(world);
            let association = store.get_association(task_id);
            let mut achievements = association.achievements;
            while let Option::Some(achievement_id) = achievements.pop_front() {
                let definition = store.get_definition(achievement_id);
                if (!definition.is_active(time)) {
                    continue;
                }

                // [Check] Achievement is not already completed, otherwise save and continue
                let mut completion = store.get_completion_or_new(player_id, @definition);
                if (completion.is_completed()) {
                    continue;
                }

                // [Effect] Update player achievement advancement
                let mut advancement = store.get_advancement(player_id, achievement_id, task_id);
                advancement.add(count);
                advancement.assess(definition.tasks, time);
                store.set_advancement(@advancement);

                // [Check] Task is completed, otherwise save and continue
                if (!advancement.is_completed()) {
                    store.set_completion(@completion);
                    continue;
                }

                // [Check] Achievement is completed, otherwise save and continue
                let mut completed = true;
                let mut tasks = definition.tasks;
                while let Option::Some(task) = tasks.pop_front() {
                    let advancement = store.get_advancement(player_id, achievement_id, *task.id);
                    completed = completed && advancement.is_completed();
                }

                if (!completed) {
                    store.set_completion(@completion);
                    continue;
                }

                // [Effect] Update player achievement completion if completed
                completion.complete(time);
                store.set_completion(@completion);

                // [Hook] Call achievement completion
                AchievementImpl::on_completion(ref self, player_id, achievement_id);

                // [Event] Emit quest completed
                store.complete(player_id, achievement_id, time);
            }
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
            ref self: ComponentState<TContractState>,
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
            AchievementImpl::on_claim(ref self, player_id, achievement_id);

            // [Event] Emit achievement claim
            let time: u64 = starknet::get_block_timestamp();
            store.claim(player_id, achievement_id, time);
        }
    }
}
