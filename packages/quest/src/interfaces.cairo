use starknet::ContractAddress;

#[starknet::interface]
pub trait IQuestRewarder<TContractState> {
    fn on_quest_claim(ref self: TContractState, recipient: ContractAddress, quest_id: felt252);
}
