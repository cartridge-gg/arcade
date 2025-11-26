pub use crate::models::index::AchievementAdvancement;
pub use crate::types::task::Task;

// Errors

pub mod errors {
    pub const ADVANCEMENT_INVALID_PLAYER_ID: felt252 = 'Achievement: invalid player id';
    pub const ADVANCEMENT_INVALID_ACHIEVEMENT_ID: felt252 = 'Achievement: invalid id';
    pub const ADVANCEMENT_INVALID_TASK_ID: felt252 = 'Achievement: invalid task id';
}

#[generate_trait]
pub impl AdvancementImpl of AdvancementTrait {
    #[inline]
    fn new(
        player_id: felt252, achievement_id: felt252, task_id: felt252,
    ) -> AchievementAdvancement {
        // [Check] Inputs
        AdvancementAssert::assert_valid_player_id(player_id);
        AdvancementAssert::assert_valid_achievement_id(achievement_id);
        AdvancementAssert::assert_valid_task_id(task_id);
        // [Return] AchievementAdvancement
        AchievementAdvancement {
            player_id: player_id,
            achievement_id: achievement_id,
            task_id: task_id,
            count: 0,
            timestamp: 0,
        }
    }

    #[inline]
    fn is_completed(self: @AchievementAdvancement) -> bool {
        self.timestamp != @0
    }

    #[inline]
    fn compute_completion(self: @AchievementAdvancement, ref tasks: Span<Task>) -> bool {
        while let Option::Some(task) = tasks.pop_front() {
            if task.id == self.task_id {
                return self.count >= task.total;
            }
        }
        false
    }

    #[inline]
    fn assess(ref self: AchievementAdvancement, mut tasks: Span<Task>, time: u64) {
        if self.is_completed() {
            return;
        }
        if !self.compute_completion(ref tasks) {
            return;
        }
        self.complete(time);
    }

    #[inline]
    fn add(ref self: AchievementAdvancement, count: u128) {
        self.count += count;
    }

    #[inline]
    fn complete(ref self: AchievementAdvancement, time: u64) {
        self.timestamp = time;
    }

    #[inline]
    fn nullify(ref self: AchievementAdvancement) {
        self.count = 0;
        self.timestamp = 0;
    }
}

#[generate_trait]
pub impl AdvancementAssert of AssertTrait {
    #[inline]
    fn assert_valid_player_id(player_id: felt252) {
        assert(player_id != 0, errors::ADVANCEMENT_INVALID_PLAYER_ID);
    }

    #[inline]
    fn assert_valid_achievement_id(achievement_id: felt252) {
        assert(achievement_id != 0, errors::ADVANCEMENT_INVALID_ACHIEVEMENT_ID);
    }

    #[inline]
    fn assert_valid_task_id(task_id: felt252) {
        assert(task_id != 0, errors::ADVANCEMENT_INVALID_TASK_ID);
    }
}

