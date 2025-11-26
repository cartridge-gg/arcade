pub use crate::models::index::QuestCompletion;
pub use crate::types::task::Task;

// Errors

pub mod errors {
    pub const COMPLETION_INVALID_PLAYER_ID: felt252 = 'Quest: invalid player id';
    pub const COMPLETION_INVALID_QUEST_ID: felt252 = 'Quest: invalid quest id';
    pub const COMPLETION_NOT_COMPLETED: felt252 = 'Quest: not completed';
    pub const COMPLETION_CLAIMED: felt252 = 'Quest: already claimed';
}

#[generate_trait]
pub impl CompletionImpl of CompletionTrait {
    #[inline]
    fn new(
        player_id: felt252, quest_id: felt252, interval_id: u64, lock_count: u32,
    ) -> QuestCompletion {
        // [Check] Inputs
        CompletionAssert::assert_valid_player_id(player_id);
        CompletionAssert::assert_valid_quest_id(quest_id);
        // [Return] QuestCompletion
        QuestCompletion {
            player_id: player_id,
            quest_id: quest_id,
            interval_id: interval_id,
            timestamp: 0,
            unclaimed: true,
            lock_count: lock_count,
        }
    }

    #[inline]
    fn is_completed(self: @QuestCompletion) -> bool {
        self.timestamp != @0
    }

    #[inline]
    fn is_unlocked(self: @QuestCompletion) -> bool {
        self.lock_count == @0
    }

    #[inline]
    fn is_undefined(self: @QuestCompletion) -> bool {
        self.timestamp == @0 && !*self.unclaimed
    }

    #[inline]
    fn unlock(ref self: QuestCompletion) {
        self.lock_count -= 1;
    }

    #[inline]
    fn complete(ref self: QuestCompletion, time: u64) {
        self.timestamp = time;
    }

    #[inline]
    fn claim(ref self: QuestCompletion) {
        // [Check] Completion is completed
        self.assert_is_completed();
        // [Check] Completion not yet claimed
        self.assert_not_claimed();
        // [Update] Completion
        self.unclaimed = false;
    }

    #[inline]
    fn nullify(ref self: QuestCompletion) {
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
    fn assert_valid_quest_id(quest_id: felt252) {
        assert(quest_id != 0, errors::COMPLETION_INVALID_QUEST_ID);
    }

    #[inline]
    fn assert_is_completed(self: @QuestCompletion) {
        assert(self.is_completed(), errors::COMPLETION_NOT_COMPLETED);
    }

    #[inline]
    fn assert_not_claimed(self: @QuestCompletion) {
        assert(*self.unclaimed, errors::COMPLETION_CLAIMED);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Constants

    const PLAYER_ID: felt252 = 'PLAYER';
    const INTERVAL_ID: u64 = 0;
    const QUEST_ID: felt252 = 'QUEST';
    const LOCK_COUNT: u32 = 0;

    #[test]
    fn test_quest_completion_new() {
        let quest = CompletionTrait::new(PLAYER_ID, QUEST_ID, INTERVAL_ID, LOCK_COUNT);
        assert_eq!(quest.player_id, PLAYER_ID);
        assert_eq!(quest.quest_id, QUEST_ID);
        assert_eq!(quest.interval_id, INTERVAL_ID);
        assert_eq!(quest.timestamp, 0);
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid player id',))]
    fn test_quest_completion_new_invalid_player_id() {
        CompletionTrait::new(0, QUEST_ID, INTERVAL_ID, LOCK_COUNT);
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid quest id',))]
    fn test_quest_completion_new_invalid_quest_id() {
        CompletionTrait::new(PLAYER_ID, 0, INTERVAL_ID, LOCK_COUNT);
    }

    #[test]
    fn test_quest_completion_complete() {
        let mut quest = CompletionTrait::new(PLAYER_ID, QUEST_ID, INTERVAL_ID, LOCK_COUNT);
        quest.complete(1000000000);
        assert_eq!(quest.timestamp, 1000000000);
    }

    #[test]
    fn test_quest_completion_nullify() {
        let mut quest = CompletionTrait::new(PLAYER_ID, QUEST_ID, INTERVAL_ID, LOCK_COUNT);
        quest.nullify();
        assert_eq!(quest.timestamp, 0);
    }
}
