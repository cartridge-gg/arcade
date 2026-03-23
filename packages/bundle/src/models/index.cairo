use starknet::ContractAddress;

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Bundle {
    #[key]
    pub id: u32,
    pub referral_percentage: u8,
    pub reissuable: bool,
    pub price: u256,
    pub payment_token: ContractAddress,
    pub payment_receiver: ContractAddress,
    pub total_issued: u64,
    pub created_at: u64,
    pub metadata: ByteArray,
    pub allower: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct BundleIssuance {
    #[key]
    pub bundle_id: u32,
    #[key]
    pub recipient: ContractAddress,
    pub issued_at: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct BundleReferral {
    #[key]
    pub id: ContractAddress,
    pub total_fees: felt252,
    pub total_referrals: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct BundleGroup {
    #[key]
    pub id: felt252,
    pub total_fees: felt252,
    pub total_referrals: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct BundleVoucher {
    #[key]
    pub bundle_id: u32,
    #[key]
    pub voucher_key: felt252,
    pub recipient: ContractAddress,
    pub claimed_at: u64,
}
