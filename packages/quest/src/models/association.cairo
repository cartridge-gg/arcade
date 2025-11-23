pub use crate::models::index::QuestAssociation;
pub use crate::types::task::Task;

#[generate_trait]
pub impl AssociationImpl of AssociationTrait {
    #[inline]
    fn new(task_id: felt252) -> QuestAssociation {
        // [Return] QuestAssociation
        QuestAssociation { task_id: task_id, quests: array![] }
    }

    #[inline]
    fn contains(self: @QuestAssociation, quest_id: felt252) -> bool {
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
    fn insert(ref self: QuestAssociation, quest_id: felt252) {
        if !self.contains(quest_id) {
            self.quests.append(quest_id);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Constants

    const TASK_ID: felt252 = 'TASK';
    const QUEST_ID: felt252 = 'QUEST';

    #[test]
    fn test_quest_association_new() {
        let mut association = AssociationTrait::new(TASK_ID);
        association.insert(QUEST_ID);
        assert_eq!(association.task_id, TASK_ID);
        assert_eq!(association.quests.len(), 1);
        assert_eq!(association.quests.at(0), @QUEST_ID);
    }

    #[test]
    fn test_quest_association_contains() {
        let mut association = AssociationTrait::new(TASK_ID);
        association.insert(QUEST_ID);
        assert_eq!(association.contains(QUEST_ID), true);
        assert_eq!(association.contains(0), false);
    }

    #[test]
    fn test_quest_association_insert_duplicate() {
        let mut association = AssociationTrait::new(TASK_ID);
        association.insert(QUEST_ID);
        association.insert(QUEST_ID);
        assert_eq!(association.quests.len(), 1);
        assert_eq!(association.quests.at(0), @QUEST_ID);
    }
}
