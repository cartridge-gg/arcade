#[starknet::component]
pub mod Component {
    // Imports

    use dojo::event::EventStorage;
    use dojo::world::WorldStorage;
    use crate::events::creation::{CreationTrait, QuestCreation};
    use crate::events::progression::{ProgressTrait, QuestProgression};
    use crate::models::advancement::AdvancementTrait;
    use crate::models::association::AssociationTrait;
    use crate::models::completion::{CompletionAssert, CompletionTrait};
    use crate::models::condition::ConditionTrait;
    use crate::models::definition::{DefinitionAssert, DefinitionTrait, QuestDefinition};
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

    pub trait QuestTrait<TContractState> {
        fn on_quest_unlock(
            ref self: ComponentState<TContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        );
        fn on_quest_complete(
            ref self: ComponentState<TContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        );
        fn on_quest_claim(
            ref self: ComponentState<TContractState>,
            player_id: felt252,
            quest_id: felt252,
            interval_id: u64,
        );
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>, impl QuestImpl: QuestTrait<TContractState>,
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
            mut world: WorldStorage,
            id: felt252,
            start: u64,
            end: u64,
            duration: u64,
            interval: u64,
            mut tasks: Span<Task>,
            mut conditions: Span<felt252>,
            metadata: QuestMetadata,
            to_store: bool,
        ) {
            // [Model] Create quest definition
            let definition = DefinitionTrait::new(
                id: id,
                start: start,
                end: end,
                duration: duration,
                interval: interval,
                tasks: tasks,
                conditions: conditions,
            );

            // [Event] Emit quest creation
            let event: QuestCreation = CreationTrait::new(
                id: id, definition: definition.clone(), metadata: metadata,
            );
            world.emit_event(@event);

            // [Check] Skip if storing is not requested
            if (!to_store) {
                return;
            }

            // [Effect] Store quest definition
            let store: Store = StoreTrait::new(world);
            store.set_definition(@definition);

            // [Effect] Update associations
            while let Option::Some(task) = tasks.pop_front() {
                let mut association = store.get_association(*task.id);
                association.insert(id);
                store.set_association(@association);
            }

            // [Effect] Update conditions
            while let Option::Some(condition) = conditions.pop_front() {
                let mut condition = store.get_condition(*condition);
                condition.insert(id);
                store.set_condition(@condition);
            };
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
            ref self: ComponentState<TContractState>,
            mut world: WorldStorage,
            player_id: felt252,
            task_id: felt252,
            count: u128,
            to_store: bool,
        ) {
            let time: u64 = starknet::get_block_timestamp();
            let event: QuestProgression = ProgressTrait::new(
                player_id: player_id, task_id: task_id, count: count, time: time,
            );
            world.emit_event(@event);

            if (!to_store) {
                return;
            }

            let store: Store = StoreTrait::new(world);
            let association = store.get_association(task_id);
            let mut quests = association.quests;
            let mut definitions: Array<QuestDefinition> = array![];
            while let Option::Some(quest_id) = quests.pop_front() {
                let definition = store.get_definition(quest_id);
                if (!definition.is_active(time)) {
                    continue;
                }

                let completion = store.get_completion_or_new(player_id, @definition, time);
                if (!completion.is_unlocked() || completion.is_completed()) {
                    continue;
                }
                definitions.append(definition);
            }

            while let Option::Some(definition) = definitions.pop_front() {
                let quest_id = definition.id;
                let interval_id = definition.compute_interval_id(time);
                let mut advancement = store
                    .get_advancement(player_id, quest_id, task_id, interval_id);
                advancement.add(count);
                advancement.assess(definition.tasks, time);
                store.set_advancement(@advancement);

                if (!advancement.is_completed()) {
                    continue;
                }

                let mut completed = true;
                let mut tasks = definition.tasks;
                while let Option::Some(task) = tasks.pop_front() {
                    let advancement = store
                        .get_advancement(player_id, quest_id, *task.id, interval_id);
                    completed = completed && advancement.is_completed();
                }
                if (!completed) {
                    continue;
                }

                let mut completion = store.get_completion_or_new(player_id, @definition, time);
                completion.complete(time);
                store.set_completion(@completion);

                QuestImpl::on_quest_complete(ref self, player_id, quest_id, interval_id);
                store.complete(player_id, quest_id, interval_id, time);

                let mut conditions = store.get_condition(quest_id);
                while let Option::Some(condition) = conditions.quests.pop_front() {
                    let definition = store.get_definition(condition);
                    let interval_id = definition.compute_interval_id(time);
                    let mut completion = store.get_completion_or_new(player_id, @definition, time);
                    completion.unlock();
                    store.set_completion(@completion);

                    QuestImpl::on_quest_unlock(ref self, player_id, condition, interval_id);
                    store.unlock(player_id, condition, interval_id, time);
                }
            }
        }

        fn claim(
            ref self: ComponentState<TContractState>,
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

            QuestImpl::on_quest_claim(ref self, player_id, quest_id, interval_id);

            // [Event] Emit quest claim
            let time: u64 = starknet::get_block_timestamp();
            store
                .claim(
                    player_id: player_id, quest_id: quest_id, interval_id: interval_id, time: time,
                );
        }
    }
}
