// Core imports

use core::num::traits::Zero;

// Internal imports

use starterpack::constants::{FEE_DENOMINATOR, MAX_PROTOCOL_FEE};
use starterpack::models::index::Config;

// Traits

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    fn new(id: u32, protocol_fee: u8, fee_receiver: starknet::ContractAddress) -> Config {
        Config { id, protocol_fee, fee_receiver }
    }

    fn protocol_fee_amount(self: @Config, amount: u256) -> u256 {
        amount * (*self.protocol_fee).into() / FEE_DENOMINATOR.into()
    }

    fn set_protocol_fee(ref self: Config, fee_percentage: u8) {
        assert!(fee_percentage <= MAX_PROTOCOL_FEE, "Config: fee too high");
        self.protocol_fee = fee_percentage;
    }

    fn set_fee_receiver(ref self: Config, receiver: starknet::ContractAddress) {
        assert!(receiver.is_non_zero(), "Config: invalid receiver");
        self.fee_receiver = receiver;
    }
}

// Asserts

#[generate_trait]
pub impl ConfigAssert of ConfigAssertTrait {
    fn assert_does_exist(self: @Config) {
        assert!(*self.id != 0, "Config: does not exist");
    }
}
