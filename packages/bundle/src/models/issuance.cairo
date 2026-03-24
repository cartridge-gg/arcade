use crate::models::index::BundleIssuance;

pub mod errors {
    pub const ISSUANCE_ALREADY_ISSUED: felt252 = 'BundleIssuance: already issued';
}

#[generate_trait]
pub impl BundleIssuanceImpl of BundleIssuanceTrait {
    fn new(bundle_id: u32, recipient: starknet::ContractAddress, time: u64) -> BundleIssuance {
        BundleIssuance { bundle_id, recipient, issued_at: time }
    }
}

#[generate_trait]
pub impl BundleIssuanceAssert of BundleIssuanceAssertTrait {
    fn assert_not_issued(self: @BundleIssuance) {
        assert(*self.issued_at == 0, errors::ISSUANCE_ALREADY_ISSUED);
    }
}

#[cfg(test)]
mod tests {
    use super::{BundleIssuanceTrait, BundleIssuanceAssert};
    use crate::models::index::BundleIssuance;

    fn RECIPIENT() -> starknet::ContractAddress {
        'RECIPIENT'.try_into().unwrap()
    }

    #[test]
    fn test_issuance_new() {
        let issuance = BundleIssuanceTrait::new(1, RECIPIENT(), 1000);
        assert_eq!(issuance.bundle_id, 1);
        assert_eq!(issuance.recipient, RECIPIENT());
        assert_eq!(issuance.issued_at, 1000);
    }

    #[test]
    fn test_issuance_assert_not_issued() {
        let issuance = BundleIssuance { bundle_id: 1, recipient: RECIPIENT(), issued_at: 0 };
        issuance.assert_not_issued();
    }

    #[test]
    #[should_panic(expected: 'BundleIssuance: already issued')]
    fn test_issuance_assert_not_issued_fails() {
        let issuance = BundleIssuanceTrait::new(1, RECIPIENT(), 1000);
        issuance.assert_not_issued();
    }
}
