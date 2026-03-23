use core::num::traits::Zero;
use crate::models::index::BundleReferral;

pub mod Errors {
    pub const REFERRAL_INVALID_ADDRESS: felt252 = 'Referral: invalid addr';
    pub const REFERRAL_INVALID_AMOUNT: felt252 = 'Referral: invalid amount';
}

#[generate_trait]
pub impl BundleReferralImpl of BundleReferralTrait {
    #[inline]
    fn new(id: starknet::ContractAddress) -> BundleReferral {
        BundleReferralAssert::assert_valid_id(id);
        BundleReferral { id, total_fees: 0, total_referrals: 0 }
    }

    #[inline]
    fn exists(self: @BundleReferral) -> bool {
        self.total_referrals != @0
    }

    #[inline]
    fn add(ref self: BundleReferral, fee: u256) {
        self.total_fees += fee.try_into().expect(Errors::REFERRAL_INVALID_AMOUNT);
        self.total_referrals += 1;
    }
}

#[generate_trait]
pub impl BundleReferralAssert of BundleReferralAssertTrait {
    #[inline]
    fn assert_valid_id(id: starknet::ContractAddress) {
        assert(id.is_non_zero(), Errors::REFERRAL_INVALID_ADDRESS);
    }
}
