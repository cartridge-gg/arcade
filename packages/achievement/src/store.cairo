//! Store struct and component management methods.

use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use crate::events::claimed::{AchievementClaimed, ClaimedTrait};
use crate::events::completed::{AchievementCompleted, CompletedTrait};
use crate::models::advancement::AchievementAdvancement;
use crate::models::association::AchievementAssociation;
use crate::models::completion::{AchievementCompletion, CompletionTrait};
use crate::models::definition::AchievementDefinition;

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
    fn get_definition(self: Store, id: felt252) -> AchievementDefinition {
        self.world.read_model(id)
    }

    #[inline]
    fn set_definition(mut self: Store, definition: @AchievementDefinition) {
        self.world.write_model(definition);
    }

    #[inline]
    fn get_completion(
        self: Store, player_id: felt252, achievement_id: felt252,
    ) -> AchievementCompletion {
        self.world.read_model((player_id, achievement_id))
    }

    #[inline]
    fn get_completion_or_new(
        self: Store, player_id: felt252, definition: @AchievementDefinition,
    ) -> AchievementCompletion {
        let completion = self.get_completion(player_id, *definition.id);
        if (!completion.is_undefined()) {
            return completion;
        }
        CompletionTrait::new(player_id, *definition.id)
    }

    #[inline]
    fn set_completion(mut self: Store, completion: @AchievementCompletion) {
        self.world.write_model(completion);
    }

    #[inline]
    fn get_association(self: Store, task_id: felt252) -> AchievementAssociation {
        self.world.read_model(task_id)
    }

    #[inline]
    fn set_association(mut self: Store, association: @AchievementAssociation) {
        self.world.write_model(association);
    }

    #[inline]
    fn get_advancement(
        self: Store, player_id: felt252, achievement_id: felt252, task_id: felt252,
    ) -> AchievementAdvancement {
        self.world.read_model((player_id, achievement_id, task_id))
    }

    #[inline]
    fn set_advancement(mut self: Store, advancement: @AchievementAdvancement) {
        self.world.write_model(advancement);
    }

    #[inline]
    fn complete(mut self: Store, player_id: felt252, achievement_id: felt252, time: u64) {
        // [Event] Emit quest completed
        let event: AchievementCompleted = CompletedTrait::new(player_id, achievement_id, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn claim(mut self: Store, player_id: felt252, achievement_id: felt252, time: u64) {
        // [Event] Emit quest claim
        let event: AchievementClaimed = ClaimedTrait::new(player_id, achievement_id, time);
        self.world.emit_event(@event);
    }
}
