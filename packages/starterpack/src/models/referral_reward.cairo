// Internal imports

use core::num::traits::Zero;
use crate::models::index::ReferralReward;

// Errors

pub mod errors {
    pub const REFERRAL_REWARD_INVALID_ADDRESS: felt252 = 'ReferralReward: invalid addr';
}

// Traits

#[generate_trait]
pub impl ReferralRewardImpl of ReferralRewardTrait {
    fn new(referrer: starknet::ContractAddress) -> ReferralReward {
        ReferralRewardAssert::assert_valid_address(referrer);
        ReferralReward { referrer, total_fees: 0, total_referrals: 0 }
    }

    fn add_referral(ref self: ReferralReward, fee_amount: u256) {
        self.total_fees += fee_amount;
        self.total_referrals += 1;
    }
}

// Asserts

#[generate_trait]
pub impl ReferralRewardAssert of ReferralRewardAssertTrait {
    fn assert_valid_address(referrer: starknet::ContractAddress) {
        assert(referrer.is_non_zero(), errors::REFERRAL_REWARD_INVALID_ADDRESS);
    }
}

