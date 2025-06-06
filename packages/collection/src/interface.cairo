use starknet::ContractAddress;
use collection::types::contract_metadata::ContractMetadata;

#[starknet::interface]
pub trait CollectionTrait<TContractState> {
    fn assert_token_owner(self: @TContractState, caller: ContractAddress, token_id: u256);
    fn assert_token_authorized(self: @TContractState, caller: ContractAddress, token_id: u256);
    fn mint(ref self: TContractState, to: ContractAddress, token_id: u256);
    fn burn(ref self: TContractState, token_id: u256);
    fn set_contract_metadata(ref self: TContractState, metadata: ContractMetadata);
    fn update_token_metadata(ref self: TContractState, token_id: u256);
}

#[starknet::interface]
pub trait Minter<TContractState> {
    fn token_uri(self: @TContractState, token_id: u256) -> ByteArray;
}
