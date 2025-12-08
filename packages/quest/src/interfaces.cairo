use starknet::ContractAddress;

#[starknet::interface]
pub trait IQuestRegistry<TContractState> {
    fn quest_claim(
        ref self: TContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
    );
}

#[starknet::interface]
pub trait IQuestRewarder<TContractState> {
    fn on_quest_unlock(
        ref self: TContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
    );
    fn on_quest_complete(
        ref self: TContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
    );
    fn on_quest_claim(
        ref self: TContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
    );
}
