use crate::models::index::BundleVoucher;

pub mod errors {
    pub const VOUCHER_INVALID_KEY: felt252 = 'Voucher: invalid key';
    pub const VOUCHER_INVALID_RECIPIENT: felt252 = 'Voucher: invalid recipient';
    pub const VOUCHER_ALREADY_CLAIMED: felt252 = 'Voucher: already claimed';
    pub const VOUCHER_NOT_RECIPIENT: felt252 = 'Voucher: not recipient';
}

#[generate_trait]
pub impl BundleVoucherImpl of BundleVoucherTrait {
    #[inline]
    fn allow(ref self: BundleVoucher, recipient: starknet::ContractAddress) {
        self.recipient = recipient;
    }

    #[inline]
    fn claim(ref self: BundleVoucher, time: u64) {
        self.claimed_at = time;
    }
}

#[generate_trait]
pub impl BundleVoucherAssert of BundleVoucherAssertTrait {
    #[inline]
    fn assert_valid_key(voucher_key: felt252) {
        assert(voucher_key != 0, errors::VOUCHER_INVALID_KEY);
    }

    #[inline]
    fn assert_valid_recipient(recipient: starknet::ContractAddress) {
        assert(recipient != 0.try_into().unwrap(), errors::VOUCHER_INVALID_RECIPIENT);
    }

    #[inline]
    fn assert_not_claimed(self: @BundleVoucher) {
        assert(*self.claimed_at == 0, errors::VOUCHER_ALREADY_CLAIMED);
    }

    #[inline]
    fn assert_is_recipient(self: @BundleVoucher, address: starknet::ContractAddress) {
        assert(*self.recipient == address, errors::VOUCHER_NOT_RECIPIENT);
    }
}
