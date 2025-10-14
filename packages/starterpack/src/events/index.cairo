//! Events

use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct StarterpackRegistered {
    #[key]
    pub starterpack_id: u32,
    pub implementation: ContractAddress,
    pub referral_percentage: u8,
    pub reissuable: bool,
    pub owner: ContractAddress,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct StarterpackIssued {
    #[key]
    pub recipient: ContractAddress,
    #[key]
    pub starterpack_id: u32,
    pub soulbound: bool,
    pub payment_token: ContractAddress,
    pub amount: u256,
    pub referrer: Option<ContractAddress>,
    pub referrer_group: Option<felt252>,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct StarterpackPaused {
    #[key]
    pub starterpack_id: u32,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct StarterpackResumed {
    #[key]
    pub starterpack_id: u32,
    pub time: u64,
}
