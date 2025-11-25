// Internal imports

pub use crate::events::index::LeaderboardScore;

// Implementations

#[generate_trait]
pub impl LeaderboardScoreImpl of LeaderboardScoreTrait {
    #[inline]
    fn new(
        leaderboard_id: felt252, game_id: felt252, player: felt252, score: u64, timestamp: u64,
    ) -> LeaderboardScore {
        LeaderboardScore {
            leaderboard_id: leaderboard_id,
            game_id: game_id,
            player: player,
            score: score,
            timestamp: timestamp,
        }
    }
}
