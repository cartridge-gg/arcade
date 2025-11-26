// Internal imports

pub use crate::events::index::AchievementClaimed;

// Implementations

#[generate_trait]
pub impl ClaimedImpl of ClaimedTrait {
    #[inline]
    fn new(player_id: felt252, achievement_id: felt252, time: u64) -> AchievementClaimed {
        AchievementClaimed { player_id: player_id, achievement_id: achievement_id, time: time }
    }
}
