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
