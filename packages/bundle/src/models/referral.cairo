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

#[cfg(test)]
mod tests {
    use super::{BundleReferralAssert, BundleReferralTrait};

    fn REFERRER() -> starknet::ContractAddress {
        'REFERRER'.try_into().unwrap()
    }

    #[test]
    fn test_referral_new() {
        let referral = BundleReferralTrait::new(REFERRER());
        assert_eq!(referral.total_fees, 0);
        assert_eq!(referral.total_referrals, 0);
    }

    #[test]
    #[should_panic(expected: 'Referral: invalid addr')]
    fn test_referral_new_invalid_address() {
        let zero: starknet::ContractAddress = 0.try_into().unwrap();
        BundleReferralTrait::new(zero);
    }

    #[test]
    fn test_referral_exists() {
        let referral = BundleReferralTrait::new(REFERRER());
        assert!(!referral.exists());
    }

    #[test]
    fn test_referral_add() {
        let mut referral = BundleReferralTrait::new(REFERRER());
        referral.add(500);
        assert_eq!(referral.total_fees, 500);
        assert_eq!(referral.total_referrals, 1);
        assert!(referral.exists());
    }

    #[test]
    fn test_referral_add_multiple() {
        let mut referral = BundleReferralTrait::new(REFERRER());
        referral.add(100);
        referral.add(200);
        referral.add(300);
        assert_eq!(referral.total_fees, 600);
        assert_eq!(referral.total_referrals, 3);
    }

    #[test]
    fn test_referral_assert_valid_id() {
        BundleReferralAssert::assert_valid_id(REFERRER());
    }

    #[test]
    #[should_panic(expected: 'Referral: invalid addr')]
    fn test_referral_assert_valid_id_zero() {
        let zero: starknet::ContractAddress = 0.try_into().unwrap();
        BundleReferralAssert::assert_valid_id(zero);
    }
}
