use crate::models::index::KitVoucher;

pub mod errors {
    pub const VOUCHER_INVALID_KEY: felt252 = 'KitVoucher: invalid key';
    pub const VOUCHER_INVALID_RECIPIENT: felt252 = 'KitVoucher: invalid recipient';
    pub const VOUCHER_ALREADY_CLAIMED: felt252 = 'KitVoucher: already claimed';
    pub const VOUCHER_NOT_RECIPIENT: felt252 = 'KitVoucher: not recipient';
}

#[generate_trait]
pub impl KitVoucherImpl of KitVoucherTrait {
    #[inline]
    fn allow(ref self: KitVoucher, recipient: starknet::ContractAddress) {
        self.recipient = recipient;
    }

    #[inline]
    fn claim(ref self: KitVoucher, time: u64) {
        self.claimed_at = time;
    }
}

#[generate_trait]
pub impl KitVoucherAssert of KitVoucherAssertTrait {
    #[inline]
    fn assert_valid_key(voucher_key: felt252) {
        assert(voucher_key != 0, errors::VOUCHER_INVALID_KEY);
    }

    #[inline]
    fn assert_valid_recipient(recipient: starknet::ContractAddress) {
        assert(recipient != 0.try_into().unwrap(), errors::VOUCHER_INVALID_RECIPIENT);
    }

    #[inline]
    fn assert_not_claimed(self: @KitVoucher) {
        assert(*self.claimed_at == 0, errors::VOUCHER_ALREADY_CLAIMED);
    }

    #[inline]
    fn assert_is_recipient(self: @KitVoucher, address: starknet::ContractAddress) {
        assert(*self.recipient == address, errors::VOUCHER_NOT_RECIPIENT);
    }
}
