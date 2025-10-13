// Dojo imports

use starknet::ContractAddress;

// Events

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

