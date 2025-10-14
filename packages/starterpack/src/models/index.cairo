//! Models

use starknet::ContractAddress;
use starterpack::types::status::Status;

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub id: u32,
    pub protocol_fee: u8,
    pub fee_receiver: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Starterpack {
    #[key]
    pub starterpack_id: u32,
    pub implementation: ContractAddress,
    pub owner: ContractAddress,
    pub referral_percentage: u8,
    pub reissuable: bool,
    pub soulbound: bool,
    pub price: u256,
    pub payment_token: ContractAddress,
    pub status: Status,
    pub total_issued: u64,
    pub created_at: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Issuance {
    #[key]
    pub starterpack_id: u32,
    #[key]
    pub recipient: ContractAddress,
    pub soulbound: bool,
    pub issued_at: u64,
}
