use core::num::traits::Zero;
use openzeppelin::interfaces::accounts::{ISRC6Dispatcher, ISRC6DispatcherTrait};
use openzeppelin::utils::snip12::OffchainMessageHash;
use starknet::ContractAddress;
use crate::models::index::BundleVoucher;
use crate::types::message::Message;

pub mod Errors {
    pub const VOUCHER_INVALID_KEY: felt252 = 'Voucher: invalid key';
    pub const VOUCHER_INVALID_RECIPIENT: felt252 = 'Voucher: invalid recipient';
    pub const VOUCHER_ALREADY_CLAIMED: felt252 = 'Voucher: already claimed';
    pub const VOUCHER_NOT_RECIPIENT: felt252 = 'Voucher: not recipient';
    pub const VOUCHER_SIGNATURE_REQUIRED: felt252 = 'Voucher: signature required';
    pub const VOUCHER_INVALID_SIGNATURE: felt252 = 'Voucher: invalid signature';
}

#[generate_trait]
pub impl BundleVoucherImpl of BundleVoucherTrait {
    #[inline]
    fn claim(ref self: BundleVoucher, recipient: ContractAddress) {
        self.recipient = recipient;
    }

    #[inline]
    fn verify(
        ref self: BundleVoucher,
        bundle_id: u32,
        recipient: ContractAddress,
        allower: ISRC6Dispatcher,
        signature: Option<Span<felt252>>,
    ) {
        // [Check] State
        self.assert_is_valid();
        self.assert_not_claimed();

        // [Check] Parameters
        BundleVoucherAssert::assert_valid_recipient(recipient);
        let sn_signature = signature.expect(Errors::VOUCHER_SIGNATURE_REQUIRED);

        // [Check] Signature validity
        let message = Message {
            bundle_id: bundle_id.into(), voucher_key: self.key, recipient: recipient,
        };
        let hash = message.get_message_hash(allower.contract_address);
        let is_valid = allower.is_valid_signature(hash, sn_signature.into());
        assert(is_valid == starknet::VALIDATED || is_valid == 1, Errors::VOUCHER_INVALID_SIGNATURE);
    }
}

#[generate_trait]
pub impl BundleVoucherAssert of AssertTrait {
    #[inline]
    fn assert_is_valid(self: @BundleVoucher) {
        assert(*self.key != 0, Errors::VOUCHER_INVALID_KEY);
    }

    #[inline]
    fn assert_valid_recipient(recipient: starknet::ContractAddress) {
        assert(recipient != 0.try_into().unwrap(), Errors::VOUCHER_INVALID_RECIPIENT);
    }

    #[inline]
    fn assert_not_claimed(self: @BundleVoucher) {
        assert((*self.recipient).is_zero(), Errors::VOUCHER_ALREADY_CLAIMED);
    }
}

#[cfg(test)]
mod tests {
    use crate::models::index::BundleVoucher;
    use super::{BundleVoucherAssert, BundleVoucherImpl};

    fn RECIPIENT() -> starknet::ContractAddress {
        'RECIPIENT'.try_into().unwrap()
    }

    fn ZERO() -> starknet::ContractAddress {
        0.try_into().unwrap()
    }

    // Tests - claim

    #[test]
    fn test_voucher_claim() {
        let mut voucher = BundleVoucher { key: 'KEY', recipient: ZERO() };
        voucher.claim(RECIPIENT());
        assert_eq!(voucher.recipient, RECIPIENT());
    }

    // Tests - assert_is_valid

    #[test]
    fn test_voucher_assert_is_valid() {
        let voucher = BundleVoucher { key: 'KEY', recipient: ZERO() };
        voucher.assert_is_valid();
    }

    #[test]
    #[should_panic(expected: 'Voucher: invalid key')]
    fn test_voucher_assert_is_valid_zero_key() {
        let voucher = BundleVoucher { key: 0, recipient: ZERO() };
        voucher.assert_is_valid();
    }

    // Tests - assert_valid_recipient

    #[test]
    fn test_voucher_assert_valid_recipient() {
        BundleVoucherAssert::assert_valid_recipient(RECIPIENT());
    }

    #[test]
    #[should_panic(expected: 'Voucher: invalid recipient')]
    fn test_voucher_assert_valid_recipient_zero() {
        BundleVoucherAssert::assert_valid_recipient(ZERO());
    }

    // Tests - assert_not_claimed

    #[test]
    fn test_voucher_assert_not_claimed() {
        let voucher = BundleVoucher { key: 'KEY', recipient: ZERO() };
        voucher.assert_not_claimed();
    }

    #[test]
    #[should_panic(expected: 'Voucher: already claimed')]
    fn test_voucher_assert_not_claimed_fails() {
        let voucher = BundleVoucher { key: 'KEY', recipient: RECIPIENT() };
        voucher.assert_not_claimed();
    }
}
