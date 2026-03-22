use crate::models::index::KitIssuance;

pub mod errors {
    pub const ISSUANCE_ALREADY_ISSUED: felt252 = 'KitIssuance: already issued';
}

#[generate_trait]
pub impl KitIssuanceImpl of KitIssuanceTrait {
    fn new(kit_id: u32, recipient: starknet::ContractAddress, time: u64) -> KitIssuance {
        KitIssuance { kit_id, recipient, issued_at: time }
    }
}

#[generate_trait]
pub impl KitIssuanceAssert of KitIssuanceAssertTrait {
    fn assert_not_issued(self: @KitIssuance) {
        assert(*self.issued_at == 0, errors::ISSUANCE_ALREADY_ISSUED);
    }
}
