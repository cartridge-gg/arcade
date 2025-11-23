// Internal imports

pub use crate::events::index::QuestUnlocked;

// Implementations

#[generate_trait]
pub impl UnlockedImpl of UnlockedTrait {
    #[inline]
    fn new(player_id: felt252, quest_id: felt252, interval_id: u64, time: u64) -> QuestUnlocked {
        QuestUnlocked {
            player_id: player_id, quest_id: quest_id, interval_id: interval_id, time: time,
        }
    }
}
