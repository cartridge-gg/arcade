//! Store struct and component management methods.

use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use starknet::ContractAddress;
use crate::events::claimed::{ClaimedTrait, QuestClaimed};
use crate::events::completed::{CompletedTrait, QuestCompleted};
use crate::events::creation::{CreationTrait, QuestCreation};
use crate::events::progression::{ProgressTrait, QuestProgression};
use crate::events::unlocked::{QuestUnlocked, UnlockedTrait};
use crate::models::advancement::{AdvancementTrait, QuestAdvancement};
use crate::models::association::{AssociationTrait, QuestAssociation};
use crate::models::completion::{CompletionTrait, QuestCompletion};
use crate::models::condition::{ConditionTrait, QuestCondition};
use crate::models::definition::{DefinitionTrait, QuestDefinition};
use crate::types::metadata::QuestMetadata;
use crate::types::task::Task;

// Structs

#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}

// Implementations

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    #[inline]
    fn new(world: WorldStorage) -> Store {
        Store { world: world }
    }

    #[inline]
    fn get_definition(self: Store, id: felt252) -> QuestDefinition {
        self.world.read_model(id)
    }

    #[inline]
    fn set_definition(mut self: Store, definition: @QuestDefinition) {
        self.world.write_model(definition);
    }

    #[inline]
    fn get_completion(
        self: Store, player_id: felt252, quest_id: felt252, interval_id: u64,
    ) -> QuestCompletion {
        self.world.read_model((player_id, quest_id, interval_id))
    }

    #[inline]
    fn get_completion_or_new(
        self: Store, player_id: felt252, definition: @QuestDefinition, time: u64,
    ) -> QuestCompletion {
        let interval_id = definition.compute_interval_id(time);
        let completion = self.get_completion(player_id, *definition.id, interval_id);
        if (!completion.is_undefined()) {
            return completion;
        }
        CompletionTrait::new(player_id, *definition.id, interval_id, definition.conditions.len())
    }

    #[inline]
    fn set_completion(mut self: Store, completion: @QuestCompletion) {
        self.world.write_model(completion);
    }

    #[inline]
    fn get_association(self: Store, task_id: felt252) -> QuestAssociation {
        self.world.read_model(task_id)
    }

    #[inline]
    fn set_association(mut self: Store, association: @QuestAssociation) {
        self.world.write_model(association);
    }

    #[inline]
    fn get_condition(self: Store, quest_id: felt252) -> QuestCondition {
        self.world.read_model(quest_id)
    }

    #[inline]
    fn set_condition(mut self: Store, condition: @QuestCondition) {
        self.world.write_model(condition);
    }

    #[inline]
    fn get_advancement(
        self: Store, player_id: felt252, quest_id: felt252, task_id: felt252, interval_id: u64,
    ) -> QuestAdvancement {
        self.world.read_model((player_id, quest_id, task_id, interval_id))
    }

    #[inline]
    fn set_advancement(mut self: Store, advancement: @QuestAdvancement) {
        self.world.write_model(advancement);
    }

    #[inline]
    fn create(
        mut self: Store,
        id: felt252,
        rewarder: ContractAddress,
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
        let definition: QuestDefinition = DefinitionTrait::new(
            id: id,
            rewarder: rewarder,
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
        self.world.emit_event(@event);
        // [Check] Skip if storing is not requested
        if (!to_store) {
            return;
        }
        // [Effect] Store quest definition
        self.set_definition(@definition);
        // [Effect] Update associations
        while let Option::Some(task) = tasks.pop_front() {
            let mut association = self.get_association(*task.id);
            association.insert(id);
            self.set_association(@association);
        }
        // [Effect] Update conditions
        while let Option::Some(condition) = conditions.pop_front() {
            let mut condition = self.get_condition(*condition);
            condition.insert(id);
            self.set_condition(@condition);
        };
    }

    #[inline]
    fn progress(
        mut self: Store,
        player_id: felt252,
        task_id: felt252,
        count: u128,
        time: u64,
        to_store: bool,
    ) {
        // [Event] Emit quest progression
        let event: QuestProgression = ProgressTrait::new(
            player_id: player_id, task_id: task_id, count: count, time: time,
        );
        self.world.emit_event(@event);
        // [Check] Skip if storing is not requested
        if (!to_store) {
            return;
        }
        // [Effect] Update player advancement
        let association = self.get_association(task_id);
        let mut quests = association.quests;
        while let Option::Some(quest_id) = quests.pop_front() {
            let definition = self.get_definition(quest_id);
            if (!definition.is_active(time)) {
                continue;
            }
            // [Check] Completion is unlocked, otherwise save and continue
            let interval_id = definition.compute_interval_id(time);
            let mut completion = self.get_completion_or_new(player_id, @definition, time);
            if (!completion.is_unlocked()) {
                self.set_completion(@completion);
                continue;
            }
            // [Check] Quest is not already completed, otherwise save and continue
            if (completion.is_completed()) {
                continue;
            }
            // [Effect] Update player quest advancement
            let mut advancement = self.get_advancement(player_id, quest_id, task_id, interval_id);
            advancement.add(count);
            advancement.assess(definition.tasks, time);
            self.set_advancement(@advancement);
            // [Check] Task is completed, otherwise save and continue
            if (!advancement.is_completed()) {
                self.set_completion(@completion);
                continue;
            }
            // [Check] Quest is completed, otherwise save and continue
            let mut completed = true;
            let mut tasks = definition.tasks;
            while let Option::Some(task) = tasks.pop_front() {
                let advancement = self.get_advancement(player_id, quest_id, *task.id, interval_id);
                completed = completed && advancement.is_completed();
            }
            if (!completed) {
                self.set_completion(@completion);
                continue;
            }
            // [Effect] Update player quest completion if completed
            completion.complete(time);
            self.set_completion(@completion);
            // [Event] Emit quest completed
            self.complete(player_id, quest_id, interval_id, time);
            // [Check] Quest unlocks other quests
            let mut conditions = self.get_condition(quest_id);
            while let Option::Some(condition) = conditions.quests.pop_front() {
                // [Effect] Update quest unlock condition for the other quest
                let definition = self.get_definition(condition);
                let interval_id = definition.compute_interval_id(time);
                let mut completion = self.get_completion_or_new(player_id, @definition, time);
                completion.unlock();
                self.set_completion(@completion);
                // [Event] Emit quest unlocked
                self.unlock(player_id, condition, interval_id, time);
            }
            // [Effect] Nullify condition
            self.set_condition(@conditions);
        }
    }

    #[inline]
    fn complete(
        mut self: Store, player_id: felt252, quest_id: felt252, interval_id: u64, time: u64,
    ) {
        // [Event] Emit quest completed
        let event: QuestCompleted = CompletedTrait::new(player_id, quest_id, interval_id, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn unlock(mut self: Store, player_id: felt252, quest_id: felt252, interval_id: u64, time: u64) {
        // [Event] Emit quest completed
        let event: QuestUnlocked = UnlockedTrait::new(player_id, quest_id, interval_id, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn claim(mut self: Store, player_id: felt252, quest_id: felt252, interval_id: u64, time: u64) {
        // [Event] Emit quest claim
        let event: QuestClaimed = ClaimedTrait::new(player_id, quest_id, interval_id, time);
        self.world.emit_event(@event);
    }
}
