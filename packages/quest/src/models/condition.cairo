pub use crate::models::index::QuestCondition;
pub use crate::types::task::Task;

#[generate_trait]
pub impl ConditionImpl of ConditionTrait {
    #[inline]
    fn new(quest_id: felt252) -> QuestCondition {
        // [Return] QuestCondition
        QuestCondition { quest_id: quest_id, quests: array![] }
    }

    #[inline]
    fn contains(self: @QuestCondition, quest_id: felt252) -> bool {
        let mut index = self.quests.len();
        while index > 0 {
            index -= 1;
            if self.quests.at(index) == @quest_id {
                return true;
            }
        }
        false
    }

    #[inline]
    fn insert(ref self: QuestCondition, quest_id: felt252) {
        if !self.contains(quest_id) {
            self.quests.append(quest_id);
        }
    }

    #[inline]
    fn remove(ref self: QuestCondition, element: felt252) {
        let mut index = self.quests.len();
        while let Option::Some(quest_id) = self.quests.pop_front() {
            index -= 1;
            if quest_id != element {
                self.quests.append(quest_id);
            }
            if index == 0 {
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Constants

    const QUEST_ID: felt252 = 'QUEST';
    const CONDITION_ID: felt252 = 'CONDITION';

    #[test]
    fn test_quest_condition_new() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert(CONDITION_ID);
        assert_eq!(association.quest_id, QUEST_ID);
        assert_eq!(association.quests.len(), 1);
        assert_eq!(association.quests.at(0), @CONDITION_ID);
    }

    #[test]
    fn test_quest_condition_contains() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert(CONDITION_ID);
        assert_eq!(association.contains(CONDITION_ID), true);
        assert_eq!(association.contains(0), false);
    }

    #[test]
    fn test_quest_condition_insert_duplicate() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert(CONDITION_ID);
        association.insert(CONDITION_ID);
        assert_eq!(association.quests.len(), 1);
        assert_eq!(association.quests.at(0), @CONDITION_ID);
    }

    #[test]
    fn test_quest_condition_remove_first() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert('CONDITION_1');
        association.insert('CONDITION_2');
        association.insert('CONDITION_3');
        association.remove('CONDITION_1');
        assert_eq!(association.quests.len(), 2);
        assert_eq!(association.quests.at(0), @'CONDITION_2');
        assert_eq!(association.quests.at(1), @'CONDITION_3');
    }

    #[test]
    fn test_quest_condition_remove_middle() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert('CONDITION_1');
        association.insert('CONDITION_2');
        association.insert('CONDITION_3');
        association.remove('CONDITION_2');
        assert_eq!(association.quests.len(), 2);
        assert_eq!(association.quests.at(0), @'CONDITION_1');
        assert_eq!(association.quests.at(1), @'CONDITION_3');
    }

    #[test]
    fn test_quest_condition_remove_last() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert('CONDITION_1');
        association.insert('CONDITION_2');
        association.insert('CONDITION_3');
        association.remove('CONDITION_3');
        assert_eq!(association.quests.len(), 2);
        assert_eq!(association.quests.at(0), @'CONDITION_1');
        assert_eq!(association.quests.at(1), @'CONDITION_2');
    }

    #[test]
    fn test_quest_condition_remove_not_found() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert('CONDITION_1');
        association.insert('CONDITION_2');
        association.insert('CONDITION_3');
        association.remove('CONDITION_4');
        assert_eq!(association.quests.len(), 3);
        assert_eq!(association.quests.at(0), @'CONDITION_1');
        assert_eq!(association.quests.at(1), @'CONDITION_2');
        assert_eq!(association.quests.at(2), @'CONDITION_3');
    }

    #[test]
    fn test_quest_condition_remove_empty() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.remove('CONDITION_1');
        assert_eq!(association.quests.len(), 0);
    }

    #[test]
    fn test_quest_condition_remove_single() {
        let mut association = ConditionTrait::new(QUEST_ID);
        association.insert('CONDITION_1');
        association.remove('CONDITION_1');
        assert_eq!(association.quests.len(), 0);
    }
}
