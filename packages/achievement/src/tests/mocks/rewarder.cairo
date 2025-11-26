#[dojo::contract]
pub mod Rewarder {
    use starknet::ContractAddress;
    use crate::interfaces::IAchievementRewarder;

    #[abi(embed_v0)]
    pub impl RewarderImpl of IAchievementRewarder<ContractState> {
        fn on_achievement_claim(
            ref self: ContractState, recipient: ContractAddress, achievement_id: felt252,
        ) {}
    }
}
