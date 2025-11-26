pub use crate::models::index::AchievementAssociation;

#[generate_trait]
pub impl AssociationImpl of AssociationTrait {
    #[inline]
    fn new(task_id: felt252) -> AchievementAssociation {
        // [Return] AchievementAssociation
        AchievementAssociation { task_id: task_id, achievements: array![] }
    }

    #[inline]
    fn contains(self: @AchievementAssociation, achievement_id: felt252) -> bool {
        let mut index = self.achievements.len();
        while index > 0 {
            index -= 1;
            if self.achievements.at(index) == @achievement_id {
                return true;
            }
        }
        false
    }

    #[inline]
    fn insert(ref self: AchievementAssociation, achievement_id: felt252) {
        if !self.contains(achievement_id) {
            self.achievements.append(achievement_id);
        }
    }
}

