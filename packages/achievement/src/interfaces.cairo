use starknet::ContractAddress;

#[starknet::interface]
pub trait IAchievementRewarder<TContractState> {
    fn on_achievement_claim(
        ref self: TContractState, recipient: ContractAddress, achievement_id: felt252,
    );
}
