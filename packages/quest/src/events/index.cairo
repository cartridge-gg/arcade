//! Events

use crate::models::definition::QuestDefinition;

#[derive(Clone, Drop, Serde)]
#[dojo::event]
pub struct QuestCreation {
    #[key]
    pub id: felt252,
    pub definition: QuestDefinition,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct QuestProgression {
    #[key]
    pub player_id: felt252,
    #[key]
    pub task_id: felt252,
    pub count: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct QuestUnlocked {
    #[key]
    pub player_id: felt252,
    #[key]
    pub quest_id: felt252,
    #[key]
    pub interval_id: u64,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct QuestCompleted {
    #[key]
    pub player_id: felt252,
    #[key]
    pub quest_id: felt252,
    #[key]
    pub interval_id: u64,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct QuestClaimed {
    #[key]
    pub player_id: felt252,
    #[key]
    pub quest_id: felt252,
    #[key]
    pub interval_id: u64,
    pub time: u64,
}
