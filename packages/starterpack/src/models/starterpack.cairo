// Internal imports

use starterpack::models::index::Starterpack;
use starterpack::types::status::Status;

// Traits

#[generate_trait]
pub impl StarterpackImpl of StarterpackTrait {
    fn new(
        starterpack_id: u32,
        implementation: starknet::ContractAddress,
        owner: starknet::ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        soulbound: bool,
        price: u256,
        payment_token: starknet::ContractAddress,
        time: u64,
    ) -> Starterpack {
        Starterpack {
            starterpack_id,
            implementation,
            owner,
            referral_percentage,
            reissuable,
            soulbound,
            price,
            payment_token,
            status: Status::Active.into(),
            total_issued: 0,
            created_at: time,
        }
    }

    fn issue(ref self: Starterpack) {
        self.total_issued += 1;
    }

    fn pause(ref self: Starterpack) {
        self.status = Status::Paused.into();
    }

    fn resume(ref self: Starterpack) {
        self.status = Status::Active.into();
    }

    fn is_active(self: @Starterpack) -> bool {
        *self.status == Status::Active.into()
    }

    fn is_owner(self: @Starterpack, address: starknet::ContractAddress) -> bool {
        *self.owner == address
    }
}

// Asserts

#[generate_trait]
pub impl StarterpackAssert of StarterpackAssertTrait {
    fn assert_is_active(self: @Starterpack) {
        assert!(
            *self.status == Status::Active.into(),
            "Starterpack: not active"
        );
    }

    fn assert_is_owner(self: @Starterpack, address: starknet::ContractAddress) {
        assert!(*self.owner == address, "Starterpack: not owner");
    }
}
