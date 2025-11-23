//! Events

// Internal imports

use starknet::ContractAddress;
use crate::types::task::Task;

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct QuestDefinition {
    #[key]
    pub id: felt252,
    pub rewarder: ContractAddress,
    pub start: u64,
    pub end: u64,
    pub duration: u64,
    pub interval: u64,
    pub tasks: Span<Task>,
    pub conditions: Span<felt252>,
    pub metadata: ByteArray,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct QuestCompletion {
    #[key]
    pub player_id: felt252,
    #[key]
    pub quest_id: felt252,
    #[key]
    pub interval_id: u64,
    pub timestamp: u64,
    pub unclaimed: bool,
    pub lock_count: u32,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct QuestAdvancement {
    #[key]
    pub player_id: felt252,
    #[key]
    pub quest_id: felt252,
    #[key]
    pub task_id: felt252,
    #[key]
    pub interval_id: u64,
    pub count: u128,
    pub timestamp: u64,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct QuestAssociation {
    #[key]
    pub task_id: felt252,
    pub quests: Array<felt252>,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct QuestCondition {
    #[key]
    pub quest_id: felt252,
    pub quests: Array<felt252>,
}

