/// Events

// Internal imports

use arcade_trophy::types::task::Task;

#[derive(Clone, Drop, Serde)]
#[dojo::event(historical: true)]
pub struct TrophyCreation {
    #[key]
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
}

#[derive(Copy, Drop, Serde)]
#[dojo::event(historical: true)]
pub struct TrophyProgression {
    #[key]
    player_id: felt252,
    #[key]
    task_id: felt252,
    count: u32,
    time: u64,
}
