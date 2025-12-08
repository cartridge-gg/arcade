#[dojo::contract]
pub mod Rewarder {
    use starknet::ContractAddress;
    use crate::interfaces::IQuestRewarder;

    #[abi(embed_v0)]
    pub impl RewarderImpl of IQuestRewarder<ContractState> {
        fn on_quest_unlock(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {}
        fn on_quest_complete(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {}
        fn on_quest_claim(
            ref self: ContractState, player: ContractAddress, quest_id: felt252, interval_id: u64,
        ) {}
    }
}
