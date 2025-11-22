pub use crate::models::index::QuestAdvancement;
pub use crate::types::task::Task;

// Errors

pub mod errors {
    pub const COMPLETION_INVALID_PLAYER_ID: felt252 = 'Quest: invalid player id';
    pub const COMPLETION_INVALID_QUEST_ID: felt252 = 'Quest: invalid quest id';
    pub const COMPLETION_INVALID_TASK_ID: felt252 = 'Quest: invalid task id';
}

#[generate_trait]
pub impl AdvancementImpl of AdvancementTrait {
    #[inline]
    fn new(
        player_id: felt252, quest_id: felt252, task_id: felt252, interval_id: u64,
    ) -> QuestAdvancement {
        // [Check] Inputs
        QuestAdvancementAssert::assert_valid_player_id(player_id);
        QuestAdvancementAssert::assert_valid_quest_id(quest_id);
        QuestAdvancementAssert::assert_valid_task_id(task_id);
        // [Return] QuestAdvancement
        QuestAdvancement {
            player_id: player_id,
            quest_id: quest_id,
            task_id: task_id,
            interval_id: interval_id,
            count: 0,
            timestamp: 0,
        }
    }

    #[inline]
    fn is_completed(self: @QuestAdvancement) -> bool {
        self.timestamp != @0
    }

    #[inline]
    fn compute_completion(self: @QuestAdvancement, ref tasks: Span<Task>) -> bool {
        while let Option::Some(task) = tasks.pop_front() {
            if task.id == self.task_id {
                return self.count >= task.total;
            }
        }
        false
    }

    #[inline]
    fn assess(ref self: QuestAdvancement, mut tasks: Span<Task>, time: u64) {
        if self.is_completed() {
            return;
        }
        if !self.compute_completion(ref tasks) {
            return;
        }
        self.complete(time);
    }

    #[inline]
    fn add(ref self: QuestAdvancement, count: u128) {
        self.count += count;
    }

    #[inline]
    fn complete(ref self: QuestAdvancement, time: u64) {
        self.timestamp = time;
    }

    #[inline]
    fn nullify(ref self: QuestAdvancement) {
        self.count = 0;
        self.timestamp = 0;
    }
}

#[generate_trait]
pub impl QuestAdvancementAssert of AssertTrait {
    #[inline]
    fn assert_valid_player_id(player_id: felt252) {
        assert(player_id != 0, errors::COMPLETION_INVALID_PLAYER_ID);
    }

    #[inline]
    fn assert_valid_quest_id(quest_id: felt252) {
        assert(quest_id != 0, errors::COMPLETION_INVALID_QUEST_ID);
    }

    #[inline]
    fn assert_valid_task_id(task_id: felt252) {
        assert(task_id != 0, errors::COMPLETION_INVALID_TASK_ID);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Constants

    const PLAYER_ID: felt252 = 'PLAYER';
    const TASK_ID: felt252 = 'TASK';
    const INTERVAL_ID: u64 = 0;
    const QUEST_ID: felt252 = 'QUEST';

    #[test]
    fn test_quest_completion_new() {
        let quest = AdvancementTrait::new(PLAYER_ID, QUEST_ID, TASK_ID, INTERVAL_ID);
        assert_eq!(quest.player_id, PLAYER_ID);
        assert_eq!(quest.quest_id, QUEST_ID);
        assert_eq!(quest.task_id, TASK_ID);
        assert_eq!(quest.interval_id, INTERVAL_ID);
        assert_eq!(quest.count, 0);
        assert_eq!(quest.timestamp, 0);
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid player id',))]
    fn test_quest_completion_new_invalid_player_id() {
        AdvancementTrait::new(0, QUEST_ID, TASK_ID, INTERVAL_ID);
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid quest id',))]
    fn test_quest_completion_new_invalid_quest_id() {
        AdvancementTrait::new(PLAYER_ID, 0, TASK_ID, INTERVAL_ID);
    }

    #[test]
    #[should_panic(expected: ('Quest: invalid task id',))]
    fn test_quest_completion_new_invalid_task_id() {
        AdvancementTrait::new(PLAYER_ID, QUEST_ID, 0, INTERVAL_ID);
    }

    #[test]
    fn test_quest_completion_add() {
        let mut quest = AdvancementTrait::new(PLAYER_ID, QUEST_ID, TASK_ID, INTERVAL_ID);
        quest.add(100);
        assert_eq!(quest.count, 100);
    }

    #[test]
    fn test_quest_completion_complete() {
        let mut quest = AdvancementTrait::new(PLAYER_ID, QUEST_ID, TASK_ID, INTERVAL_ID);
        quest.complete(1000000000);
        assert_eq!(quest.timestamp, 1000000000);
    }

    #[test]
    fn test_quest_completion_nullify() {
        let mut quest = AdvancementTrait::new(PLAYER_ID, QUEST_ID, TASK_ID, INTERVAL_ID);
        quest.nullify();
        assert_eq!(quest.count, 0);
        assert_eq!(quest.timestamp, 0);
    }

    #[test]
    fn test_quest_completion_assess() {
        let mut quest = AdvancementTrait::new(PLAYER_ID, QUEST_ID, TASK_ID, INTERVAL_ID);
        quest.add(50);
        quest
            .assess(
                array![Task { id: TASK_ID, total: 100, description: Default::default() }].span(),
                1000000000,
            );
        assert_eq!(quest.timestamp, 0);
        quest.add(50);
        quest
            .assess(
                array![Task { id: TASK_ID, total: 100, description: Default::default() }].span(),
                1000000000,
            );
        assert_eq!(quest.timestamp, 1000000000);
    }
}
