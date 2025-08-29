//! Events

// Internal imports

use achievement::types::task::Task;


#[derive(Clone, Drop, Serde)]
#[dojo::event]
pub struct TrophyCreation {
    #[key]
    pub id: felt252,
    pub hidden: bool,
    pub index: u8,
    pub points: u16,
    pub start: u64,
    pub end: u64,
    pub group: felt252,
    pub icon: felt252,
    pub title: felt252,
    pub description: ByteArray,
    pub tasks: Span<Task>,
    pub data: ByteArray,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct TrophyProgression {
    #[key]
    pub player_id: felt252,
    #[key]
    pub task_id: felt252,
    pub count: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct TrophyPinning {
    #[key]
    pub player_id: felt252,
    #[key]
    pub achievement_id: felt252,
    pub time: u64,
}
