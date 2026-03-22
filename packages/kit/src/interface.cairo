use starknet::ContractAddress;
use crate::component::Component::KitQuote;

#[starknet::interface]
pub trait IKit<TState> {
    fn get_metadata(self: @TState, kit_id: u32) -> ByteArray;
    fn quote(
        self: @TState, kit_id: u32, quantity: u32, has_referrer: bool, client_percentage: u8,
    ) -> KitQuote;
    fn issue(ref self: TState, recipient: ContractAddress, kit_id: u32, quantity: u32);
    fn allow(ref self: TState, recipient: ContractAddress, kit_id: u32, voucher_key: felt252);
}
