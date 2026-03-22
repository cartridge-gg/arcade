use core::num::traits::Zero;
use crate::models::index::KitGroup;

pub mod Errors {
    pub const GROUP_INVALID_GROUP: felt252 = 'Group: invalid group';
    pub const GROUP_INVALID_AMOUNT: felt252 = 'Group: invalid amount';
}

#[generate_trait]
pub impl KitGroupImpl of KitGroupTrait {
    #[inline]
    fn new(id: felt252) -> KitGroup {
        KitGroupAssert::assert_valid_id(id);
        KitGroup { id, total_fees: 0, total_referrals: 0 }
    }

    #[inline]
    fn exists(self: @KitGroup) -> bool {
        self.total_referrals != @0
    }

    #[inline]
    fn add(ref self: KitGroup, fee: u256) {
        self.total_fees += fee.try_into().expect(Errors::GROUP_INVALID_AMOUNT);
        self.total_referrals += 1;
    }
}

#[generate_trait]
pub impl KitGroupAssert of KitGroupAssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id.is_non_zero(), Errors::GROUP_INVALID_GROUP);
    }
}
