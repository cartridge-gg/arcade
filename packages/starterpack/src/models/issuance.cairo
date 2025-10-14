// Internal imports

use starterpack::models::index::Issuance;

// Traits

#[generate_trait]
pub impl IssuanceImpl of IssuanceTrait {
    fn new(
        starterpack_id: u32,
        recipient: starknet::ContractAddress,
        soulbound: bool,
        time: u64,
    ) -> Issuance {
        Issuance {
            starterpack_id,
            recipient,
            soulbound,
            issued_at: time,
        }
    }
}

// Asserts

#[generate_trait]
pub impl IssuanceAssert of IssuanceAssertTrait {
    fn assert_not_issued(self: @Issuance) {
        assert!(*self.issued_at == 0, "Issuance: already issued");
    }
}
