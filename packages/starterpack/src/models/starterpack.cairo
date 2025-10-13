// Dojo imports

use starknet::ContractAddress;

// Internal imports

use starterpack::types::status::Status;

// Models

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Starterpack {
    #[key]
    pub starterpack_id: u32,
    pub implementation: ContractAddress,
    pub owner: ContractAddress,
    pub referral_percentage: u8,
    pub reissuable: bool,
    pub soulbound: bool,
    pub price: u256,
    pub payment_token: ContractAddress,
    pub status: Status,
    pub total_issued: u64,
    pub created_at: u64,
}

// Traits

#[generate_trait]
pub impl StarterpackImpl of StarterpackTrait {
    fn new(
        starterpack_id: u32,
        implementation: ContractAddress,
        owner: ContractAddress,
        referral_percentage: u8,
        reissuable: bool,
        soulbound: bool,
        price: u256,
        payment_token: ContractAddress,
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
            status: Status::Active,
            total_issued: 0,
            created_at: time,
        }
    }

    fn pause(ref self: Starterpack) {
        self.status = Status::Paused;
    }

    fn resume(ref self: Starterpack) {
        self.status = Status::Active;
    }

    fn issue(ref self: Starterpack) {
        self.total_issued += 1;
    }
}

// Asserts

#[generate_trait]
pub impl StarterpackAssert of StarterpackAssertTrait {
    fn assert_is_active(self: @Starterpack) {
        assert!(
            (*self.status).into() == Status::Active.into(),
            "Starterpack: starterpack is not active"
        );
    }

    fn assert_is_owner(self: @Starterpack, caller: ContractAddress) {
        assert!(*self.owner == caller, "Starterpack: caller is not owner");
    }
}

