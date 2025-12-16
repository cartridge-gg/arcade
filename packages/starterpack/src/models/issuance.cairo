// Internal imports

use crate::models::index::Issuance;

// Errors

pub mod errors {
    pub const ISSUANCE_ALREADY_ISSUED: felt252 = 'Issuance: already issued';
}

// Traits

#[generate_trait]
pub impl IssuanceImpl of IssuanceTrait {
    fn new(starterpack_id: u32, recipient: starknet::ContractAddress, time: u64) -> Issuance {
        Issuance { starterpack_id, recipient, issued_at: time }
    }
}

// Asserts

#[generate_trait]
pub impl IssuanceAssert of IssuanceAssertTrait {
    fn assert_not_issued(self: @Issuance) {
        assert(*self.issued_at == 0, errors::ISSUANCE_ALREADY_ISSUED);
    }
}
