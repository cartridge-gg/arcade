//! Store struct and component management methods.

use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use crate::events::claimed::{ClaimedTrait, QuestClaimed};
use crate::events::completed::{CompletedTrait, QuestCompleted};
use crate::events::unlocked::{QuestUnlocked, UnlockedTrait};
use crate::models::advancement::QuestAdvancement;
use crate::models::association::QuestAssociation;
use crate::models::completion::{CompletionTrait, QuestCompletion};
use crate::models::condition::QuestCondition;
use crate::models::definition::{DefinitionTrait, QuestDefinition};

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
    fn complete(
        mut self: Store,
        player_id: felt252,
        quest_id: felt252,
        interval_id: u64,
        time: u64,
    ) {
        // [Event] Emit quest completed
        let event: QuestCompleted = CompletedTrait::new(player_id, quest_id, interval_id, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn unlock(
        mut self: Store,
        player_id: felt252,
        quest_id: felt252,
        interval_id: u64,
        time: u64,
    ) {
        // [Event] Emit quest completed
        let event: QuestUnlocked = UnlockedTrait::new(player_id, quest_id, interval_id, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn claim(
        mut self: Store,
        player_id: felt252,
        quest_id: felt252,
        interval_id: u64,
        time: u64,
    ) {
        // [Event] Emit quest claim
        let event: QuestClaimed = ClaimedTrait::new(player_id, quest_id, interval_id, time);
        self.world.emit_event(@event);
    }
}
