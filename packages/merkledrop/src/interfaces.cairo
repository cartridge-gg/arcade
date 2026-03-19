use starknet::ContractAddress;

#[starknet::interface]
pub trait IMerkledropImplementation<TContractState> {
    /// Returns the recipient address for a given data.
    /// The implementation defines the data structure (e.g. hash(claimer, amount)).
    fn get_recipient(self: @TContractState, data: Span<felt252>) -> ContractAddress;

    /// Called after a successful claim verification.
    /// The implementation should distribute rewards to the recipient.
    fn on_merkledrop_claim(
        ref self: TContractState,
        root: felt252,
        leaf: felt252,
        recipient: ContractAddress,
        data: Span<felt252>,
    );
}
