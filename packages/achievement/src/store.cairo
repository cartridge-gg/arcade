//! Store struct and component management methods.

use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use starknet::ContractAddress;
use crate::events::claimed::{AchievementClaimed, ClaimedTrait};
use crate::events::completed::{AchievementCompleted, CompletedTrait};
use crate::events::creation::{CreationTrait, TrophyCreation};
use crate::events::progress::{ProgressTrait, TrophyProgression};
use crate::models::advancement::{AchievementAdvancement, AdvancementTrait};
use crate::models::association::{AchievementAssociation, AssociationTrait};
use crate::models::completion::{AchievementCompletion, CompletionTrait};
use crate::models::definition::{AchievementDefinition, DefinitionTrait};
use crate::types::metadata::AchievementMetadata;
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
    fn create(
        mut self: Store,
        id: felt252,
        rewarder: ContractAddress,
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
        self.world.emit_event(@event);
        // [Check] Skip if storing is not requested
        if (!to_store) {
            return;
        }
        // [Model] Create achievement definition
        let definition: AchievementDefinition = DefinitionTrait::new(
            id: id, rewarder: rewarder, start: start, end: end, tasks: tasks,
        );
        self.set_definition(@definition);
        // [Effect] Update associations
        while let Option::Some(task) = tasks.pop_front() {
            let mut association = self.get_association(*task.id);
            association.insert(id);
            self.set_association(@association);
        }
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
        // [Event] Emit achievement progression
        let event: TrophyProgression = ProgressTrait::new(
            player_id: player_id, task_id: task_id, count: count, time: time,
        );
        self.world.emit_event(@event);
        // [Check] Skip if storing is not requested
        if (!to_store) {
            return;
        }
        // [Effect] Update player advancement
        let association = self.get_association(task_id);
        let mut achievements = association.achievements;
        while let Option::Some(achievement_id) = achievements.pop_front() {
            let definition = self.get_definition(achievement_id);
            if (!definition.is_active(time)) {
                continue;
            }
            // [Check] Achievement is not already completed, otherwise save and continue
            let mut completion = self.get_completion_or_new(player_id, @definition);
            if (completion.is_completed()) {
                continue;
            }
            // [Effect] Update player achievement advancement
            let mut advancement = self.get_advancement(player_id, achievement_id, task_id);
            advancement.add(count);
            advancement.assess(definition.tasks, time);
            self.set_advancement(@advancement);
            // [Check] Task is completed, otherwise save and continue
            if (!advancement.is_completed()) {
                self.set_completion(@completion);
                continue;
            }
            // [Check] Achievement is completed, otherwise save and continue
            let mut completed = true;
            let mut tasks = definition.tasks;
            while let Option::Some(task) = tasks.pop_front() {
                let advancement = self.get_advancement(player_id, achievement_id, *task.id);
                completed = completed && advancement.is_completed();
            }
            if (!completed) {
                self.set_completion(@completion);
                continue;
            }
            // [Effect] Update player achievement completion if completed
            completion.complete(time);
            self.set_completion(@completion);
            // [Event] Emit quest completed
            self.complete(player_id, achievement_id, time);
        }
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
