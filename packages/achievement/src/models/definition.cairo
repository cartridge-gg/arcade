use starknet::ContractAddress;
pub use crate::models::index::AchievementDefinition;
use crate::types::task::Task;

// Errors

pub mod errors {
    pub const DEFINITION_INVALID_ID: felt252 = 'Achievement: invalid id';
    pub const DEFINITION_INVALID_TASKS: felt252 = 'Achievement: invalid tasks';
    pub const DEFINITION_INVALID_DURATION: felt252 = 'Achievement: invalid duration';
    pub const DEFINITION_NOT_EXIST: felt252 = 'Achievement: does not exist';
}

#[generate_trait]
pub impl DefinitionImpl of DefinitionTrait {
    #[inline]
    fn new(
        id: felt252, rewarder: ContractAddress, start: u64, end: u64, tasks: Span<Task>,
    ) -> AchievementDefinition {
        // [Check] Inputs
        DefinitionAssert::assert_valid_id(id);
        DefinitionAssert::assert_valid_tasks(tasks);
        DefinitionAssert::assert_valid_duration(start, end);
        // [Return] AchievementDefinition
        AchievementDefinition { id: id, rewarder: rewarder, start: start, end: end, tasks: tasks }
    }

    #[inline]
    fn is_active(self: @AchievementDefinition, time: u64) -> bool {
        (time >= *self.start || *self.start == 0) && (time < *self.end || *self.end == 0)
    }
}

#[generate_trait]
pub impl DefinitionAssert of AssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id != 0, errors::DEFINITION_INVALID_ID);
    }

    #[inline]
    fn assert_valid_tasks(tasks: Span<Task>) {
        assert(tasks.len() > 0, errors::DEFINITION_INVALID_TASKS);
    }

    #[inline]
    fn assert_valid_duration(start: u64, end: u64) {
        assert(end >= start || end == 0, errors::DEFINITION_INVALID_DURATION);
    }

    #[inline]
    fn assert_does_exist(self: @AchievementDefinition) {
        assert(self.tasks.len() > 0, errors::DEFINITION_NOT_EXIST);
    }
}

