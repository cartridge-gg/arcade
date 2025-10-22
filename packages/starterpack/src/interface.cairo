use starknet::ContractAddress;

#[starknet::interface]
pub trait IStarterpackImplementation<TContractState> {
    /// Called when a starterpack is issued to distribute assets to the recipient
    /// @param recipient The address receiving the starterpack assets
    /// @param starterpack_id The ID of the starterpack being issued
    /// @param quantity The number of starterpacks being issued
    fn on_issue(
        ref self: TContractState, recipient: ContractAddress, starterpack_id: u32, quantity: u32,
    );

    /// Returns the supply limit for this starterpack
    /// @param starterpack_id The ID of the starterpack
    /// @return Option<u32> Some(limit) if there is a supply limit, None if unlimited
    fn supply(self: @TContractState, starterpack_id: u32) -> Option<u32>;
}

