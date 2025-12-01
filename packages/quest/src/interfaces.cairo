use starknet::ContractAddress;

#[starknet::interface]
pub trait IQuestRewarder<TContractState> {
    fn on_quest_unlock(
        ref self: TContractState, recipient: ContractAddress, quest_id: felt252, interval_id: u64,
    );
    fn on_quest_complete(
        ref self: TContractState, recipient: ContractAddress, quest_id: felt252, interval_id: u64,
    );
    fn on_quest_claim(
        ref self: TContractState, recipient: ContractAddress, quest_id: felt252, interval_id: u64,
    );
}
