//! Store struct and component management methods.

use dojo::event::EventStorage;
use dojo::world::WorldStorage;
use crate::events::score::LeaderboardScoreTrait;

// Structs

#[derive(Copy, Drop)]
pub struct Store {
    world: WorldStorage,
}

// Implementations

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    #[inline]
    fn new(world: WorldStorage) -> Store {
        Store { world: world }
    }

    #[inline]
    fn submit(
        mut self: Store,
        leaderboard_id: felt252,
        game_id: felt252,
        player_id: felt252,
        score: u64,
        time: u64,
    ) {
        // [Event] Emit score
        let score = LeaderboardScoreTrait::new(
            leaderboard_id: leaderboard_id,
            game_id: game_id,
            player: player_id,
            score: score,
            timestamp: time,
        );
        self.world.emit_event(@score);
    }
}
