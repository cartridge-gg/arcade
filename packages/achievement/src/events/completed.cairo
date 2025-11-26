// Internal imports

pub use crate::events::index::AchievementCompleted;

// Implementations

#[generate_trait]
pub impl CompletedImpl of CompletedTrait {
    #[inline]
    fn new(player_id: felt252, achievement_id: felt252, time: u64) -> AchievementCompleted {
        AchievementCompleted { player_id: player_id, achievement_id: achievement_id, time: time }
    }
}
