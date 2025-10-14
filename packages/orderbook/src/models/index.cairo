//! Models

// Re-export shared RBAC Moderator model
pub use models::rbac::models::index::Moderator;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Book {
    #[key]
    pub id: u32,
    pub version: u8,
    pub paused: bool,
    pub royalties: bool,
    pub counter: u32,
    pub fee_num: u32,
    pub fee_receiver: felt252,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Order {
    #[key]
    pub id: u32,
    #[key]
    pub collection: felt252,
    #[key]
    pub token_id: u256,
    pub royalties: bool,
    pub category: u8,
    pub status: u8,
    pub expiration: u64,
    pub quantity: u128,
    pub price: u128,
    pub currency: felt252,
    pub owner: felt252,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct MetadataAttribute {
    #[key]
    pub identity: starknet::ContractAddress,
    #[key]
    pub collection: felt252,
    #[key]
    pub token_id: u256,
    #[key]
    pub index: u32,
    pub trait_type: ByteArray,
    pub value: ByteArray,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct MetadataAttributeIntegrity {
    #[key]
    pub identity: starknet::ContractAddress,
    #[key]
    pub collection: felt252,
    #[key]
    pub token_id: u256,
    pub state: felt252,
}
