//! Store struct and component management methods.

// Dojo imports

// Events imports

use achievement::events::creation::{CreationTrait, TrophyCreation};
use achievement::events::pinning::{PinningTrait, TrophyPinning};
use achievement::events::progress::{ProgressTrait, TrophyProgression};
// Internal imports

use achievement::types::task::Task;
use dojo::event::EventStorage;
use dojo::world::WorldStorage;

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
    fn create(
        mut self: Store,
        id: felt252,
        hidden: bool,
        index: u8,
        points: u16,
        start: u64,
        end: u64,
        group: felt252,
        icon: felt252,
        title: felt252,
        description: ByteArray,
        tasks: Span<Task>,
        data: ByteArray,
    ) {
        let event: TrophyCreation = CreationTrait::new(
            id, hidden, index, points, start, end, group, icon, title, description, tasks, data,
        );
        self.world.emit_event(@event);
    }

    #[inline]
    fn progress(mut self: Store, player_id: felt252, task_id: felt252, count: u128, time: u64) {
        let event: TrophyProgression = ProgressTrait::new(player_id, task_id, count, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn pin(mut self: Store, player_id: felt252, achievement_id: felt252, time: u64) {
        let event: TrophyPinning = PinningTrait::new(player_id, achievement_id, time);
        self.world.emit_event(@event);
    }

    #[inline]
    fn unpin(mut self: Store, player_id: felt252, achievement_id: felt252) {
        let event: TrophyPinning = PinningTrait::new(player_id, achievement_id, 0);
        self.world.emit_event(@event);
    }
}
