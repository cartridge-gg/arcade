pub use crate::models::index::AchievementCompletion;

// Errors

pub mod errors {
    pub const COMPLETION_INVALID_PLAYER_ID: felt252 = 'Achievement: invalid player id';
    pub const COMPLETION_INVALID_ACHIEVEMENT_ID: felt252 = 'Achievement: invalid id';
    pub const COMPLETION_NOT_COMPLETED: felt252 = 'Achievement: not completed';
    pub const COMPLETION_CLAIMED: felt252 = 'Achievement: already claimed';
}

#[generate_trait]
pub impl CompletionImpl of CompletionTrait {
    #[inline]
    fn new(player_id: felt252, achievement_id: felt252) -> AchievementCompletion {
        // [Check] Inputs
        CompletionAssert::assert_valid_player_id(player_id);
        CompletionAssert::assert_valid_achievement_id(achievement_id);
        // [Return] AchievementCompletion
        AchievementCompletion {
            player_id: player_id, achievement_id: achievement_id, timestamp: 0, unclaimed: true,
        }
    }

    #[inline]
    fn is_completed(self: @AchievementCompletion) -> bool {
        self.timestamp != @0
    }

    #[inline]
    fn is_undefined(self: @AchievementCompletion) -> bool {
        self.timestamp == @0 && !*self.unclaimed
    }

    #[inline]
    fn complete(ref self: AchievementCompletion, time: u64) {
        self.timestamp = time;
    }

    #[inline]
    fn claim(ref self: AchievementCompletion) {
        // [Check] Achievement is completed
        self.assert_is_completed();
        // [Check] Completion not yet claimed
        self.assert_not_claimed();
        // [Update] Completion
        self.unclaimed = false;
    }

    #[inline]
    fn nullify(ref self: AchievementCompletion) {
        self.timestamp = 0;
    }
}

#[generate_trait]
pub impl CompletionAssert of AssertTrait {
    #[inline]
    fn assert_valid_player_id(player_id: felt252) {
        assert(player_id != 0, errors::COMPLETION_INVALID_PLAYER_ID);
    }

    #[inline]
    fn assert_valid_achievement_id(achievement_id: felt252) {
        assert(achievement_id != 0, errors::COMPLETION_INVALID_ACHIEVEMENT_ID);
    }

    #[inline]
    fn assert_is_completed(self: @AchievementCompletion) {
        assert(self.is_completed(), errors::COMPLETION_NOT_COMPLETED);
    }

    #[inline]
    fn assert_not_claimed(self: @AchievementCompletion) {
        assert(*self.unclaimed, errors::COMPLETION_CLAIMED);
    }
}

