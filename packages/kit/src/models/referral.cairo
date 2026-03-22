use core::num::traits::Zero;
use crate::models::index::KitReferral;

pub mod Errors {
    pub const REFERRAL_INVALID_ADDRESS: felt252 = 'Referral: invalid addr';
    pub const REFERRAL_INVALID_AMOUNT: felt252 = 'Referral: invalid amount';
}

#[generate_trait]
pub impl KitReferralImpl of KitReferralTrait {
    #[inline]
    fn new(id: starknet::ContractAddress) -> KitReferral {
        KitReferralAssert::assert_valid_id(id);
        KitReferral { id, total_fees: 0, total_referrals: 0 }
    }

    #[inline]
    fn exists(self: @KitReferral) -> bool {
        self.total_referrals != @0
    }

    #[inline]
    fn add(ref self: KitReferral, fee: u256) {
        self.total_fees += fee.try_into().expect(Errors::REFERRAL_INVALID_AMOUNT);
        self.total_referrals += 1;
    }
}

#[generate_trait]
pub impl KitReferralAssert of KitReferralAssertTrait {
    #[inline]
    fn assert_valid_id(id: starknet::ContractAddress) {
        assert(id.is_non_zero(), Errors::REFERRAL_INVALID_ADDRESS);
    }
}
