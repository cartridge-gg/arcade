use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::event]
pub struct KitRegistered {
    #[key]
    pub kit_id: u32,
    pub referral_percentage: u8,
    pub reissuable: bool,
    pub time: u64,
    pub payment_receiver: ContractAddress,
}

#[derive(Drop, Serde)]
#[dojo::event]
pub struct KitUpdated {
    #[key]
    pub kit_id: u32,
    pub referral_percentage: u8,
    pub reissuable: bool,
    pub price: u256,
    pub payment_token: ContractAddress,
    pub metadata: ByteArray,
    pub time: u64,
    pub payment_receiver: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct KitIssued {
    #[key]
    pub recipient: ContractAddress,
    #[key]
    pub kit_id: u32,
    pub payment_token: ContractAddress,
    pub amount: u256,
    pub quantity: u32,
    pub referrer: Option<ContractAddress>,
    pub referrer_group: Option<felt252>,
    pub time: u64,
}
