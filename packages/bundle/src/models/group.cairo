use core::num::traits::Zero;
use crate::models::index::BundleGroup;

pub mod Errors {
    pub const GROUP_INVALID_GROUP: felt252 = 'Group: invalid group';
    pub const GROUP_INVALID_AMOUNT: felt252 = 'Group: invalid amount';
}

#[generate_trait]
pub impl BundleGroupImpl of BundleGroupTrait {
    #[inline]
    fn new(id: felt252) -> BundleGroup {
        BundleGroupAssert::assert_valid_id(id);
        BundleGroup { id, total_fees: 0, total_referrals: 0 }
    }

    #[inline]
    fn exists(self: @BundleGroup) -> bool {
        self.total_referrals != @0
    }

    #[inline]
    fn add(ref self: BundleGroup, fee: u256) {
        self.total_fees += fee.try_into().expect(Errors::GROUP_INVALID_AMOUNT);
        self.total_referrals += 1;
    }
}

#[generate_trait]
pub impl BundleGroupAssert of BundleGroupAssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id.is_non_zero(), Errors::GROUP_INVALID_GROUP);
    }
}

#[cfg(test)]
mod tests {
    use super::{BundleGroupTrait, BundleGroupAssert};

    #[test]
    fn test_group_new() {
        let group = BundleGroupTrait::new('GROUP_1');
        assert_eq!(group.total_fees, 0);
        assert_eq!(group.total_referrals, 0);
    }

    #[test]
    #[should_panic(expected: 'Group: invalid group')]
    fn test_group_new_invalid_id() {
        BundleGroupTrait::new(0);
    }

    #[test]
    fn test_group_exists() {
        let group = BundleGroupTrait::new('GROUP_1');
        assert!(!group.exists());
    }

    #[test]
    fn test_group_add() {
        let mut group = BundleGroupTrait::new('GROUP_1');
        group.add(100);
        assert_eq!(group.total_fees, 100);
        assert_eq!(group.total_referrals, 1);
    }

    #[test]
    fn test_group_add_multiple() {
        let mut group = BundleGroupTrait::new('GROUP_1');
        group.add(100);
        group.add(200);
        assert_eq!(group.total_fees, 300);
        assert_eq!(group.total_referrals, 2);
        assert!(group.exists());
    }

    #[test]
    fn test_group_assert_valid_id() {
        BundleGroupAssert::assert_valid_id('GROUP_1');
    }

    #[test]
    #[should_panic(expected: 'Group: invalid group')]
    fn test_group_assert_valid_id_zero() {
        BundleGroupAssert::assert_valid_id(0);
    }
}
