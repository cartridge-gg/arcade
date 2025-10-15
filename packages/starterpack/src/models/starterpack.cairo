// Internal imports

use starterpack::models::index::Starterpack;
use starterpack::types::status::Status;

// Errors

pub mod errors {
    pub const STARTERPACK_NOT_ACTIVE: felt252 = 'Starterpack: not active';
    pub const STARTERPACK_NOT_OWNER: felt252 = 'Starterpack: not owner';
}

// Traits

#[generate_trait]
pub impl StarterpackImpl of StarterpackTrait {
    fn new(
        starterpack_id: u32,
        implementation: starknet::ContractAddress,
        owner: starknet::ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
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
            price,
            payment_token,
            status: Status::Active,
            total_issued: 0,
            created_at: time,
        }
    }

    fn issue(ref self: Starterpack) {
        self.total_issued += 1;
    }

    fn pause(ref self: Starterpack) {
        self.status = Status::Paused;
    }

    fn resume(ref self: Starterpack) {
        self.status = Status::Active;
    }

    fn is_active(self: @Starterpack) -> bool {
        match *self.status {
            Status::Active => true,
            _ => false,
        }
    }

    fn is_owner(self: @Starterpack, address: starknet::ContractAddress) -> bool {
        *self.owner == address
    }
}

// Asserts

#[generate_trait]
pub impl StarterpackAssert of StarterpackAssertTrait {
    fn assert_is_active(self: @Starterpack) {
        assert(*self.status == Status::Active, errors::STARTERPACK_NOT_ACTIVE);
    }

    fn assert_is_owner(self: @Starterpack, address: starknet::ContractAddress) {
        assert(*self.owner == address, errors::STARTERPACK_NOT_OWNER);
    }
}
