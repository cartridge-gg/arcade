use core::num::traits::Zero;
use starknet::ContractAddress;
use crate::constants::FEE_DENOMINATOR;
use crate::models::index::Kit;

pub mod errors {
    pub const KIT_QUANTITY_EXCEEDS_LIMIT: felt252 = 'Kit: quantity > 1';
    pub const KIT_SUPPLY_EXCEEDED: felt252 = 'Kit: supply exceeded';
    pub const KIT_NOT_FOUND: felt252 = 'Kit: not found';
    pub const KIT_NOT_ALLOWER: felt252 = 'Kit: not allower';
}

#[generate_trait]
pub impl KitImpl of KitTrait {
    #[inline]
    fn new(
        id: u32,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: starknet::ContractAddress,
        payment_receiver: starknet::ContractAddress,
        metadata: ByteArray,
        time: u64,
        allower: starknet::ContractAddress,
    ) -> Kit {
        Kit {
            id,
            referral_percentage,
            reissuable,
            price,
            payment_token,
            payment_receiver,
            total_issued: 0,
            created_at: time,
            metadata,
            allower,
        }
    }

    #[inline]
    fn update(
        ref self: Kit,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: starknet::ContractAddress,
        payment_receiver: starknet::ContractAddress,
        allower: starknet::ContractAddress,
    ) {
        self.referral_percentage = referral_percentage;
        self.reissuable = reissuable;
        self.price = price;
        self.payment_token = payment_token;
        self.payment_receiver = payment_receiver;
        self.allower = allower;
    }

    #[inline]
    fn update_metadata(ref self: Kit, metadata: ByteArray) {
        self.metadata = metadata;
    }

    #[inline]
    fn issue(ref self: Kit, quantity: u32) {
        self.total_issued += quantity.into();
    }

    #[inline]
    fn get_referral_fee(self: @Kit, amount: u256, has_referrer: bool) -> u256 {
        if !has_referrer {
            return 0;
        }
        amount * (*self.referral_percentage).into() / FEE_DENOMINATOR.into()
    }

    #[inline]
    fn get_client_fee(self: @Kit, amount: u256, client_percentage: u8) -> u256 {
        amount * client_percentage.into() / FEE_DENOMINATOR.into()
    }


    #[inline]
    fn calculate_referral_fee(
        self: @Kit, amount: u256, referrer: Option<ContractAddress>, payer: ContractAddress,
    ) -> (ContractAddress, u256) {
        let fee = self.get_referral_fee(amount, true);
        let receiver = referrer.unwrap_or(payer);
        if fee == 0 || receiver.is_zero() || receiver == payer {
            return (core::num::traits::Zero::zero(), 0);
        }
        (receiver, fee)
    }

    #[inline]
    fn calculate_client_fee(
        self: @Kit, amount: u256, client: Option<ContractAddress>, client_percentage: u8,
    ) -> (ContractAddress, u256) {
        let fee = self.get_client_fee(amount, client_percentage);
        let receiver = client.unwrap_or(core::num::traits::Zero::zero());
        if fee == 0 || receiver.is_zero() {
            return (core::num::traits::Zero::zero(), 0);
        }
        (receiver, fee)
    }
}

#[generate_trait]
pub impl KitAssert of KitAssertTrait {
    fn assert_quantity_allowed(self: @Kit, quantity: u32) {
        if !*self.reissuable {
            assert(quantity == 1, errors::KIT_QUANTITY_EXCEEDS_LIMIT);
        }
    }

    fn assert_does_exist(self: @Kit) {
        assert(*self.created_at != 0, errors::KIT_NOT_FOUND);
    }

    fn assert_is_allower(self: @Kit, caller: starknet::ContractAddress) {
        assert((*self.allower) == caller, errors::KIT_NOT_ALLOWER);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_kit(referral_percentage: u8) -> Kit {
        Kit {
            id: 1,
            referral_percentage,
            reissuable: true,
            price: 1000,
            payment_token: 0.try_into().unwrap(),
            payment_receiver: 'RECEIVER'.try_into().unwrap(),
            total_issued: 0,
            created_at: 1,
            metadata: "",
            allower: 0.try_into().unwrap(),
        }
    }

    // Tests - get_referral_fee

    #[test]
    fn test_get_referral_fee_with_referrer() {
        let kit = make_kit(10);
        assert_eq!(kit.get_referral_fee(1000, true), 100); // 10% of 1000
    }

    #[test]
    fn test_get_referral_fee_no_referrer() {
        let kit = make_kit(10);
        assert_eq!(kit.get_referral_fee(1000, false), 0);
    }

    #[test]
    fn test_get_referral_fee_zero_percentage() {
        let kit = make_kit(0);
        assert_eq!(kit.get_referral_fee(1000, true), 0);
    }

    #[test]
    fn test_get_referral_fee_zero_amount() {
        let kit = make_kit(10);
        assert_eq!(kit.get_referral_fee(0, true), 0);
    }

    #[test]
    fn test_get_referral_fee_max_percentage() {
        let kit = make_kit(50);
        assert_eq!(kit.get_referral_fee(1000, true), 500); // 50% of 1000
    }

    // Tests - get_client_fee

    #[test]
    fn test_get_client_fee() {
        let kit = make_kit(0);
        assert_eq!(kit.get_client_fee(1000, 5), 50); // 5% of 1000
    }

    #[test]
    fn test_get_client_fee_zero_percentage() {
        let kit = make_kit(0);
        assert_eq!(kit.get_client_fee(1000, 0), 0);
    }

    #[test]
    fn test_get_client_fee_zero_amount() {
        let kit = make_kit(0);
        assert_eq!(kit.get_client_fee(0, 5), 0);
    }

    // Tests - calculate_referral_fee

    #[test]
    fn test_calculate_referral_fee_with_referrer() {
        let kit = make_kit(10);
        let referrer: ContractAddress = 'REFERRER'.try_into().unwrap();
        let payer: ContractAddress = 'PAYER'.try_into().unwrap();
        let (receiver, fee) = kit.calculate_referral_fee(1000, Option::Some(referrer), payer);
        assert_eq!(fee, 100);
        assert_eq!(receiver, referrer);
    }

    #[test]
    fn test_calculate_referral_fee_no_referrer() {
        let kit = make_kit(10);
        let payer: ContractAddress = 'PAYER'.try_into().unwrap();
        let (_, fee) = kit.calculate_referral_fee(1000, Option::None, payer);
        assert_eq!(fee, 0);
    }

    #[test]
    fn test_calculate_referral_fee_self_referral() {
        let kit = make_kit(10);
        let payer: ContractAddress = 'PAYER'.try_into().unwrap();
        // Self-referral: referrer == payer → fee = 0
        let (_, fee) = kit.calculate_referral_fee(1000, Option::Some(payer), payer);
        assert_eq!(fee, 0);
    }

    #[test]
    fn test_calculate_referral_fee_zero_referrer() {
        let kit = make_kit(10);
        let payer: ContractAddress = 'PAYER'.try_into().unwrap();
        let zero: ContractAddress = 0.try_into().unwrap();
        let (_, fee) = kit.calculate_referral_fee(1000, Option::Some(zero), payer);
        assert_eq!(fee, 0);
    }

    // Tests - calculate_client_fee

    #[test]
    fn test_calculate_client_fee_with_client() {
        let kit = make_kit(0);
        let client: ContractAddress = 'CLIENT'.try_into().unwrap();
        let (receiver, fee) = kit.calculate_client_fee(1000, Option::Some(client), 5);
        assert_eq!(fee, 50);
        assert_eq!(receiver, client);
    }

    #[test]
    fn test_calculate_client_fee_no_client() {
        let kit = make_kit(0);
        let (_, fee) = kit.calculate_client_fee(1000, Option::None, 5);
        assert_eq!(fee, 0);
    }

    #[test]
    fn test_calculate_client_fee_zero_percentage() {
        let kit = make_kit(0);
        let client: ContractAddress = 'CLIENT'.try_into().unwrap();
        let (_, fee) = kit.calculate_client_fee(1000, Option::Some(client), 0);
        assert_eq!(fee, 0);
    }

    #[test]
    fn test_calculate_client_fee_zero_client_address() {
        let kit = make_kit(0);
        let zero: ContractAddress = 0.try_into().unwrap();
        let (_, fee) = kit.calculate_client_fee(1000, Option::Some(zero), 5);
        assert_eq!(fee, 0);
    }
}
