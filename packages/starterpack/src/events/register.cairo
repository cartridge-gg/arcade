// Dojo imports

use starknet::ContractAddress;

// Events

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

