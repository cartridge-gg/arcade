// Internal imports

pub use achievement::events::index::TrophyProgression;

// Errors

pub mod errors {
    pub const PROGRESS_INVALID_TASK: felt252 = 'Progress: invalid task';
}

// Implementations

#[generate_trait]
pub impl ProgressImpl of ProgressTrait {
    #[inline]
    fn new(player_id: felt252, task_id: felt252, count: u128, time: u64) -> TrophyProgression {
        // [Check] Inputs
        ProgressAssert::assert_valid_task(task_id);
        // [Return] Progress
        TrophyProgression { player_id, task_id, count, time }
    }
}

#[generate_trait]
pub impl ProgressAssert of AssertTrait {
    #[inline]
    fn assert_valid_task(task_id: felt252) {
        assert(task_id != 0, errors::PROGRESS_INVALID_TASK);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::ProgressTrait;

    // Constants

    const PLAYER_ID: felt252 = 'PLAYER';
    const TASK_ID: felt252 = 'TASK';
    const COUNT: u128 = 100;
    const TIME: u64 = 1000000000;

    #[test]
    fn test_achievement_progress_new() {
        let progress = ProgressTrait::new(PLAYER_ID, TASK_ID, COUNT, TIME);
        assert(progress.player_id == PLAYER_ID, 'Invalid player id');
        assert(progress.task_id == TASK_ID, 'Invalid task id');
        assert(progress.count == COUNT, 'Invalid count');
        assert(progress.time == TIME, 'Invalid time');
    }

    #[test]
    #[should_panic(expected: ('Progress: invalid task',))]
    fn test_achievement_progress_new_invalid_task() {
        ProgressTrait::new(PLAYER_ID, 0, COUNT, TIME);
    }
}
