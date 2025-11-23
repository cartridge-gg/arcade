#[dojo::contract]
pub mod Rewarder {
    use starknet::ContractAddress;
    use crate::interfaces::IQuestRewarder;

    #[abi(embed_v0)]
    pub impl RewarderImpl of IQuestRewarder<ContractState> {
        fn on_quest_claim(ref self: ContractState, recipient: ContractAddress, quest_id: felt252) {}
    }
}
