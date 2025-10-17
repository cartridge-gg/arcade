use starknet::ContractAddress;

#[starknet::interface]
pub trait IStarterpackImplementation<TContractState> {
    /// Called when a starterpack is issued to distribute assets to the recipient
    /// @param recipient The address receiving the starterpack assets
    /// @param starterpack_id The ID of the starterpack being issued
    fn on_issue(ref self: TContractState, recipient: ContractAddress, starterpack_id: u32);
}

