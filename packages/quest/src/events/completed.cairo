// Internal imports

pub use crate::events::index::QuestCompleted;

// Implementations

#[generate_trait]
pub impl CompletedImpl of CompletedTrait {
    #[inline]
    fn new(player_id: felt252, quest_id: felt252, interval_id: u64, time: u64) -> QuestCompleted {
        QuestCompleted {
            player_id: player_id, quest_id: quest_id, interval_id: interval_id, time: time,
        }
    }
}
