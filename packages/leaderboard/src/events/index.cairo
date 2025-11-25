//! Events

#[derive(Clone, Drop, Serde)]
#[dojo::event]
pub struct LeaderboardScore {
    #[key]
    pub leaderboard_id: felt252,
    #[key]
    pub game_id: felt252,
    pub player: felt252,
    pub score: u64,
    pub timestamp: u64,
}
