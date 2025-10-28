// Internal imports

use starterpack::interface::{
    IStarterpackImplementationDispatcher, IStarterpackImplementationDispatcherTrait,
};
use starterpack::models::index::Starterpack;
use starterpack::types::status::Status;

// Errors

pub mod errors {
    pub const STARTERPACK_NOT_ACTIVE: felt252 = 'Starterpack: not active';
    pub const STARTERPACK_NOT_OWNER: felt252 = 'Starterpack: not owner';
    pub const STARTERPACK_QUANTITY_EXCEEDS_LIMIT: felt252 = 'Starterpack: quantity > 1';
    pub const STARTERPACK_SUPPLY_EXCEEDED: felt252 = 'Starterpack: supply exceeded';
    pub const STARTERPACK_NOT_FOUND: felt252 = 'Starterpack: not found';
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
        metadata: ByteArray,
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
            metadata,
        }
    }

    fn update(
        ref self: Starterpack,
        implementation: starknet::ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        price: u256,
        payment_token: starknet::ContractAddress,
    ) {
        self.implementation = implementation;
        self.referral_percentage = referral_percentage;
        self.reissuable = reissuable;
        self.price = price;
        self.payment_token = payment_token;
    }

    fn update_metadata(ref self: Starterpack, metadata: ByteArray) {
        self.metadata = metadata;
    }

    fn issue(ref self: Starterpack, quantity: u32) {
        self.total_issued += quantity.into();
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

    fn assert_quantity_allowed(self: @Starterpack, quantity: u32) {
        if !*self.reissuable {
            assert(quantity == 1, errors::STARTERPACK_QUANTITY_EXCEEDS_LIMIT);
        }
    }

    fn assert_supply_available(self: @Starterpack, quantity: u32) {
        let implementation = IStarterpackImplementationDispatcher {
            contract_address: *self.implementation,
        };

        if let Option::Some(supply_limit) = implementation.supply(*self.starterpack_id) {
            let new_total: u64 = *self.total_issued + quantity.into();
            assert(new_total <= supply_limit.into(), errors::STARTERPACK_SUPPLY_EXCEEDED);
        }
    }

    fn assert_does_exist(self: @Starterpack) {
        assert(*self.created_at != 0, errors::STARTERPACK_NOT_FOUND);
    }
}
