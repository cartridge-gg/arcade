use starknet::ContractAddress;
use crate::component::Component::BundleQuote;

#[starknet::interface]
pub trait IBundle<TState> {
    fn get_metadata(self: @TState, bundle_id: u32) -> ByteArray;
    fn quote(
        self: @TState, bundle_id: u32, quantity: u32, has_referrer: bool, client_percentage: u8,
    ) -> BundleQuote;
    fn issue(
        ref self: TState,
        recipient: ContractAddress,
        bundle_id: u32,
        quantity: u32,
        referrer: Option<ContractAddress>,
        referrer_group: Option<felt252>,
        client: Option<ContractAddress>,
        client_percentage: u8,
        voucher_key: Option<felt252>,
        signature: Option<Span<felt252>>,
    );
}
