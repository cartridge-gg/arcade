// Internal imports

use core::num::traits::Zero;
use starterpack::models::index::GroupReward;

// Errors

pub mod errors {
    pub const GROUP_REWARD_INVALID_GROUP: felt252 = 'GroupReward: invalid group';
}

// Traits

#[generate_trait]
pub impl GroupRewardImpl of GroupRewardTrait {
    fn new(group: felt252) -> GroupReward {
        GroupRewardAssert::assert_valid_group(group);
        GroupReward { group, total_fees: 0, total_referrals: 0 }
    }

    fn add_referral(ref self: GroupReward, fee_amount: u256) {
        self.total_fees += fee_amount;
        self.total_referrals += 1;
    }
}

// Asserts

#[generate_trait]
pub impl GroupRewardAssert of GroupRewardAssertTrait {
    fn assert_valid_group(group: felt252) {
        assert(group.is_non_zero(), errors::GROUP_REWARD_INVALID_GROUP);
    }
}

