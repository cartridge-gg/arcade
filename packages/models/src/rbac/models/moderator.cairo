// Internal imports

pub use models::rbac::models::index::Moderator;
use models::rbac::types::role::Role;

// Errors

pub mod errors {
    pub const MODERATOR_INVALID_ADDRESS: felt252 = 'Moderator: invalid address';
    pub const MODERATOR_INVALID_ROLE: felt252 = 'Moderator: invalid role';
    pub const MODERATOR_NOT_ALLOWED: felt252 = 'Moderator: not allowed';
    pub const MODERATOR_NOT_GRANTABLE: felt252 = 'Moderator: not grantable';
    pub const MODERATOR_NOT_REVOKABLE: felt252 = 'Moderator: not revokable';
}

#[generate_trait]
pub impl ModeratorImpl of ModeratorTrait {
    #[inline]
    fn new(address: felt252, role: Role) -> Moderator {
        // [Check] Inputs
        ModeratorAssert::assert_valid_address(address);
        ModeratorAssert::assert_valid_role(role);
        // [Return] Moderator
        Moderator { address, role: role.into() }
    }

    #[inline]
    fn grant(ref self: Moderator, role: Role) {
        // [Check] Address
        ModeratorAssert::assert_valid_address(self.address);
        // [Check] Role
        ModeratorAssert::assert_valid_role(role);
        // [Check] Grantability
        self.assert_is_grantable(role);
        // [Update] Role
        self.role = role.into();
    }

    #[inline]
    fn revoke(ref self: Moderator) {
        // [Check] Address
        ModeratorAssert::assert_valid_address(self.address);
        // [Check] Revokability
        let role: Role = Role::None;
        self.assert_is_revokable(role);
        // [Update] Role
        self.role = role.into();
    }
}

#[generate_trait]
pub impl ModeratorAssert of ModeratorAssertTrait {
    #[inline]
    fn assert_valid_address(address: felt252) {
        assert(address != 0, errors::MODERATOR_INVALID_ADDRESS);
    }

    #[inline]
    fn assert_valid_role(role: Role) {
        assert(role != Role::None, errors::MODERATOR_INVALID_ROLE);
    }

    #[inline]
    fn assert_is_grantable(self: @Moderator, role: Role) {
        assert(self.role < @role.into(), errors::MODERATOR_NOT_GRANTABLE);
    }

    #[inline]
    fn assert_is_revokable(self: @Moderator, role: Role) {
        assert(self.role > @role.into(), errors::MODERATOR_NOT_REVOKABLE);
    }

    #[inline]
    fn assert_is_allowed(self: @Moderator, role: Role) {
        assert(self.role >= @role.into(), errors::MODERATOR_NOT_ALLOWED);
    }
}

