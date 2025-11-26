//! Models

// Internal imports

use starknet::ContractAddress;
use crate::types::task::Task;

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct AchievementDefinition {
    #[key]
    pub id: felt252,
    pub rewarder: ContractAddress,
    pub start: u64,
    pub end: u64,
    pub tasks: Span<Task>,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct AchievementCompletion {
    #[key]
    pub player_id: felt252,
    #[key]
    pub achievement_id: felt252,
    pub timestamp: u64,
    pub unclaimed: bool,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct AchievementAdvancement {
    #[key]
    pub player_id: felt252,
    #[key]
    pub achievement_id: felt252,
    #[key]
    pub task_id: felt252,
    pub count: u128,
    pub timestamp: u64,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct AchievementAssociation {
    #[key]
    pub task_id: felt252,
    pub achievements: Array<felt252>,
}

